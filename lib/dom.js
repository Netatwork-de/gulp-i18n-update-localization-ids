'use strict';

/*
    Utility for working with parse5 parsed html fragments.
*/

const ignoredNodeNames = new Set(['#comment', '#documentType', '#text']);

function* traverse (node) {
    if (ignoredNodeNames.has(node.nodeName)) {
        return
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
    return node.nodeName === '#text' && node.value.trim() !== '';
}

function analyzeContent(node) {
    let hasText;
    let hasNonText;
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

module.exports = {
    traverse,
    analyzeContent
};
