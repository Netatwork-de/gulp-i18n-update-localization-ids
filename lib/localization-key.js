'use strict';

/*
    Representation of the "t" localization key attribute:
    A LocalizationKey is a map of attributes (or content types) to their localization id's.

    When setting localized attributes, the following implications apply:
    - Both key and value must be strings.
    - If 'html' is set and 'text' exists, 'text' is removed.
    - If 'text' is set and 'html' exists, 'html' is removed.
*/

const DomRelatedError = require('./dom-related-error');

const ENTRY_REGEXP = /\s*(?:\[([a-z0-9\s_,.-]+)\])?\s*([a-z0-9_.-]+)\s*(?:;\s*)?/ig;
const ATTR_DELIMITER_REGEXP = /,/g;

class LocalizationKey extends Map {
    set(attr, id) {
        if (typeof attr !== 'string') {
            throw new TypeError('attr must be a string.');
        }
        if (typeof id !== 'string') {
            throw new TypeError('id must be a string.');
        }
        super.delete({html: 'text', text: 'html'}[attr]);
        super.set(attr, id);
    }

    ids() {
        return new Set((function * () {
            for (const [, id] of this) {
                yield id;
            }
        }).call(this));
    }

    mapIds() {
        const attrs = new Map();
        for (const [attr, id] of this) {
            const entry = attrs.get(id);
            if (entry) {
                entry.push(attr);
            } else {
                attrs.set(id, [attr]);
            }
        }
        return attrs;
    }

    format() {
        return Array.from(this.mapIds())
            .map(([id, attrs]) => `[${attrs.join(',')}]${id}`)
            .join(';');
    }

    static parse(spec) {
        const lkey = new LocalizationKey();
        ENTRY_REGEXP.lastIndex = 0;
        while (ENTRY_REGEXP.lastIndex < spec.length) {
            const entry = ENTRY_REGEXP.exec(spec);
            if (!entry) {
                throw new SyntaxError(`Unable to parse t="${spec}"`);
            }
            (entry[1] || 'text').split(ATTR_DELIMITER_REGEXP)
                .map(attr => attr.trim())
                .filter(attr => attr.length > 0)
                .forEach(attr => {
                    if (lkey.has(attr)) {
                        throw new SyntaxError(`${attr} has multiple localization keys.`);
                    }
                    lkey.set(attr, entry[2]);
                });
        }
        return lkey;
    }

    static fromDom(domUtility, vinyl, node, attrName = 't') {
        try {
            return LocalizationKey.parse(domUtility.getAttr(node, attrName) || '');
        } catch (err) {
            throw new DomRelatedError(vinyl, node, err.message);
        }
    }
}

module.exports = LocalizationKey;
