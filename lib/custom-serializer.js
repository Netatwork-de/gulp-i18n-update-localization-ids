'use strict'

const Serializer = require('parse5/lib/serializer');
const HTML = require('parse5/lib/common/html');
const NS = HTML.NAMESPACES;

/**
 * This class overrides the default parse5 serializer to remove escaping
 * of attribute values and text node content. It also removes empty attribute
 * values if they were also not present in the original html that was parsed.
 * 
 * Some parts are adapted from the original source code.
 * See https://github.com/inikulin/parse5/blob/master/packages/parse5/lib/serializer/index.js
 */
class CustomSerializer extends Serializer {
    constructor(node, options, originalSource) {
        if (typeof originalSource !== 'string') {
            throw new TypeError('originalSource must be a string.');
        }

        super(node, options);
        this.originalSource = originalSource;
    }

    /**
     * Check if the original attribute had a specified value.
     * @param {*} node 
     * @param {*} name 
     */
    _originalAttrHasValue(node, name) {
        const info = node.sourceCodeLocation && node.sourceCodeLocation.attrs && node.sourceCodeLocation.attrs[name];
        return info && /[\"\']$/.test(this.originalSource.slice(info.startOffset, info.endOffset));
    }

    _serializeAttributes(node) {
        const attrs = this.treeAdapter.getAttrList(node);
        for (const {name, value, namespace, prefix} of attrs) {
            this.html += ' ' + (prefix || '') + name;
            if (value !== '' || this._originalAttrHasValue(node, name, value)) {
                this.html += '="' + value + '"';
            }
        }
    }

    _serializeTextNode(node) {
        const content = this.treeAdapter.getTextNodeContent(node);
        this.html += content;
    }
}

module.exports = CustomSerializer;
