'use strict';

const PluginError = require('plugin-error');
const {parseFragment, serialize} = require('parse5');
const transform = require('./lib/transform');
const contentsToString = require('./lib/contents-to-string');
const {traverse, getAttr, setAttr, deleteAttr, analyzeContent} = require('./lib/dom');
const DomRelatedError = require('./lib/dom-related-error');
const LocalizationKey = require('./lib/localization-key');
const {name: packageName} = require('./package.json');

const CUSTOM_TAG_NAME_REGEXP = /-/;
const LOCALIZATION_ID_REGEXP = /^[a-z0-9_.-]+$/i;

function option(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

module.exports = function (options = {}) {
    // Normalize plugin options:
    const encoding = option(options.encoding, 'utf8');
    const assertFormatting = option(options.assertFormatting, true);

    const idTemplate = option(options.idTemplate, postfix => `t${postfix}`);
    if (typeof idTemplate !== 'function') {
        throw new TypeError('options.idTemplate must be a function.');
    }

    if (!Array.isArray(options.whitelist)) {
        throw new TypeError('options.whitelist must be an array.');
    }
    const whitelist = new Map(options.whitelist.map((entry, index) => {
        if (!entry || typeof entry !== 'object') {
            throw new TypeError(`options.whitelist[${index}] must be an object.`);
        }
        if (typeof entry.tagName !== 'string') {
            throw new TypeError(`options.whitelist[${index}].tagName must be a string.`);
        }
        const attrs = option(entry.attrs, []);
        if (!(Symbol.iterator in attrs)) {
            throw new TypeError(`options.whitelist[${index}].attrs must be iterable.`);
        }
        const content = option(entry.content, CUSTOM_TAG_NAME_REGEXP.test(entry.tagName) ? false : 'text');
        if (![false, 'text', 'html'].includes(content)) {
            throw new TypeError(`options.whitelist[${index}].content must be false, "text" or "html".`)
        }
        return [entry.tagName, {attrs: new Set(attrs), content}]
    }));

    // Return a stream to transform each file:
    return transform(async function(inFile) {
        const inContents = (await contentsToString(inFile, encoding))
            .replace(/\r\n|\r/g, '\n');

        // Throw on non-html-fragments because the current implementation
        // messes up the formatting outside head and body tags:
        if (/^(<!DOCTYPE|<html)/i.test(inContents)) {
            throw new PluginError(packageName, `Only html fragments are supported. Not full html documents. File: ${inFile.path}`);
        }

        // Parse the html fragment:
        const dom = parseFragment(inContents, {sourceCodeLocationInfo: true});
        if (assertFormatting && serialize(dom) !== inContents) {
            throw new PluginError(packageName, `Serializing changes would break the original formatting. File: ${inFile.path}`);
        }

        const knownIds = new Set();
        const candidates = [];
        for (const node of traverse(dom)) {
            const {hasText, hasNonText} = analyzeContent(node);
            const whitelisted = whitelist.get(node.tagName);
            if (whitelisted) {
                if (hasText && hasNonText) {
                    throw new DomRelatedError(inFile, node, 'Tag contains both text and non-text content.');
                }
                const originalKey = LocalizationKey.fromDom(inFile, node);
                for (const id of originalKey.ids()) {
                    knownIds.add(id);
                }
                candidates.push({node, hasText, whitelisted, originalKey});
            } else if (hasText) {
                throw new DomRelatedError(inFile, node, 'Non-whitelisted tag has text content.');
            } else if (getAttr(node, 't')) {
                throw new DomRelatedError(inFile, node, 'Non-whitelisted tag has a "t" attribute.');
            }
        }

        let nextIdPostfix = 0;
        const assignedPreferredIds = new Set();
        function getOrCreateUniqueId(id) {
            if (!id || assignedPreferredIds.has(id)) {
                let lastGeneratedId;
                do {
                    id = idTemplate(nextIdPostfix);
                    if (typeof id !== 'string' || !LOCALIZATION_ID_REGEXP.test(id)) {
                        throw new PluginError(packageName, `options.idTemplate returned an invalid id: ${id}.`);
                    }

                    if (lastGeneratedId === id) {
                        throw new PluginError(packageName, `options.idTemplate returned the same id for different postfixes: ${id}`);
                    }
                    lastGeneratedId = id;

                    nextIdPostfix++;
                } while (knownIds.has(id))
            }
            knownIds.add(id);
            assignedPreferredIds.add(id);
            return id;
        }

        for (const {node, hasText, whitelisted, originalKey} of candidates) {
            const newKey = new LocalizationKey();
            if (whitelisted.content) {
                if (hasText) {
                    const preferredId = originalKey.get('html') || originalKey.get('text');
                    newKey.set(whitelisted.content, getOrCreateUniqueId(preferredId));
                }
            } else if (originalKey.has('html') || originalKey.has('text')) {
                throw new DomRelatedError(inFile, node, 'Content is already localized, but not whitelisted.');
            } else if (hasText) {
                throw new DomRelatedError(inFile, node, 'Content is not whitelisted to be localized.');
            }
            for (const attr of whitelisted.attrs) {
                if (getAttr(node, attr)) {
                    const preferredId = originalKey.get(attr);
                    newKey.set(attr, getOrCreateUniqueId(preferredId));
                }
            }
            for (const [attr] of originalKey) {
                if (attr !== 'text' && attr !== 'html' && !whitelisted.attrs.has(attr)) {
                    throw new DomRelatedError(inFile, node, `Attribute "${attr}" is already localized, but not whitelisted.`);
                }
            }

            if (newKey.size > 0) {
                setAttr(node, 't', newKey.format());
            } else {
                deleteAttr(node, 't');
            }
        }

        const outFile = inFile.clone({contents: false});
        outFile.contents = Buffer.from(serialize(dom), encoding);
        this.push(outFile);
    });
};
