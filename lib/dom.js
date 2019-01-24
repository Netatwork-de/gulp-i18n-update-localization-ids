'use strict';

/*
    Utility for working with parse5 parsed html fragments.
*/

const IgnoreMap = require('./ignore-map');

const ignoredNodeNames = new Set(['#comment', '#documentType', '#text']);

function init({
    ignore = new IgnoreMap()
} = {}) {
    function* traverse (node) {
        if (ignoredNodeNames.has(node.nodeName)) {
            return;
        }
        if (node.tagName && ignore.tagName(node.tagName)) {
            return;
        }
        yield node;
        if (node.childNodes) {
            for (const childNode of node.childNodes) {
                yield* traverse(childNode);
            }
        }
        if (node.content) {
            yield* traverse(node.content);
        }
    }

    function isTextNode(node) {
        if (node.nodeName === '#text') {
            const value = node.value.trim();
            return value !== '' && !ignore.content(value);
        }
        return false;
    }

    function getAttr(node, name) {
        if (!node.attrs) {
            return;
        }
        for (const attr of node.attrs) {
            if (attr.name === name) {
                return attr.value;
            }
        }
        return;
    }

    function setAttr(node, name, value) {
        if (node.attrs) {
            for (const attr of node.attrs) {
                if (attr.name === name) {
                    attr.value = value;
                    return;
                }
            }
            node.attrs.push({name, value});
        } else {
            throw new Error('Node can not have attributes.');
        }
    }

    function deleteAttr(node, name) {
        if (!node.attrs) {
            throw new Error('Node can not have attributes.');
        }
        const index = node.attrs.findIndex(attr => {
            if (attr.name === name) {
                return true;
            }
        });
        if (index >= 0) {
            node.attrs.splice(index, 1);
        }
    }

    function analyzeContent(node) {
        let hasText = false;
        let hasNonText = false;
        for (const childNode of node.childNodes) {
            if (isTextNode(childNode)) {
                hasText = true;
            } else {
                hasNonText = true;
            }
            if (hasText && hasNonText) {
                break;
            }
        }
        return {hasText, hasNonText};
    }

    return {
        traverse,
        getAttr,
        setAttr,
        deleteAttr,
        analyzeContent
    };
}

module.exports = init;
