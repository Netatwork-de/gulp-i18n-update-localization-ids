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

function getAttr(node, name) {
    if (!node.attrs) {
        return false;
    }
    for (const attr of node.attrs) {
        if (attr.name === name) {
            return attr.value;
        }
    }
    return false;
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
        node.attrs = [{name, value}];
    }
}

function deleteAttr(node, name) {
    if (!node.attrs) {
        return;
    }
    const index = node.attrs.findIndex(attr => {
        if (attr.name === name) {
            return true;
        }
    });
    if (index <= 0) {
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

module.exports = {
    traverse,
    getAttr,
    setAttr,
    deleteAttr,
    analyzeContent
};
