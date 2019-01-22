'use strict';

const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const {parseFragment, serialize} = require('parse5');
const transform = require('./lib/transform');
const contentsToString = require('./lib/contents-to-string');
const {traverse, analyzeContent} = require('./lib/dom');

module.exports = function (options = {}) {
    const encoding = options.encoding || 'utf8';
    const assertFormatting = ('assertFormatting' in options) ? options.assertFormatting : true;

    return transform(async function(inFile) {
        const inContents = (await contentsToString(inFile, encoding))
            .replace(/\r\n|\r/g, '\n');

        // Throw on non-fragments because the current implementation
        // messes up the formatting outside head and body tags:
        if (/^(<!DOCTYPE|<html)/i.test(inContents)) {
            throw new PluginError(name, `Only html fragments are supported. Not full html documents. File: ${inFile.path}`);
        }

        const dom = parseFragment(inContents, {sourceCodeLocationInfo: true});

        if (assertFormatting && serialize(dom) !== inContents) {
            throw new PluginError(name, `Formatting the file would break it's formatting. File: ${inFile.path}`);
        }

        for (const node of traverse(dom)) {
            const {hasText, hasNonText} = analyzeContent(node);

            // TODO:
            // + If the tag has text content:
            //   + Throw if there are also other child tags.
            //   + Throw if the tag name is not white-listed.
            //   + Mark as candidate.
            // + Mark as candidate.
            // + If the tag is white-listed and has a localizable attribute, mark as candidate.
            // + Throw if the tag is not white-listed and has a "t" attribute.
        }

        // TODO: For all localization candidates:
        // + Reformat the "t" attribute.
        // + For each id in the "t" attribute, ensure that it's unique and throw otherwise.

        const outFile = inFile.clone({contents: false});
        outFile.contents = Buffer.from(serialize(dom), encoding);
        this.push(outFile);
    });
};
