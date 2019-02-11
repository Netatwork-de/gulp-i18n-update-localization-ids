'use strict'

const Serializer = require('parse5/lib/serializer');

/**
 * This class overrides the default parse5 serializer to remove escaping
 * of attribute values and text node content. It also removes empty attribute
 * values if they were also not present in the original html that was parsed.
 * 
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

    _originalSourceFor(locationInfo) {
        return this.originalSource.slice(locationInfo.startOffset, locationInfo.endOffset);
    }

    _serializeAttributes(node) {
        const nodeInfo = node.sourceCodeLocation;
        const attrsInfo = nodeInfo && nodeInfo.attrs;
        const attrs = this.treeAdapter.getAttrList(node);

        let prevAttrInfo = null;
        for (const {name, value, prefix} of attrs) {
            const attrInfo = attrsInfo && attrsInfo[name];

            if (attrInfo) {
                if (prevAttrInfo) {
                    this.html += this.originalSource.slice(prevAttrInfo.endOffset, attrInfo.startOffset);
                } else {
                    const nodeName = this.treeAdapter.getTagName(node);
                    this.html += this.originalSource.slice(nodeInfo.startOffset + nodeName.length + 1, attrInfo.startOffset);
                }
            } else {
                this.html += ' ';
            }

            this.html += (prefix || '') + name;
            if (!attrInfo || /[\"\']$/.test(this._originalSourceFor(attrInfo))) {
                this.html += '="' + value + '"';
            }
            if (attrInfo) {
                prevAttrInfo = attrInfo;
            }
        }
    }

    _serializeTextNode(node) {
        const content = this.treeAdapter.getTextNodeContent(node);
        this.html += content;
    }
}

module.exports = CustomSerializer;
