'use strict';

class IgnoreMap {
    constructor() {
        this._content = new Scope();
        this._tagName = new Scope();
    }

    use(options, optionPath = 'options') {
        if (Array.isArray(options)) {
            options.forEach((child, i) => this.use(child, `${optionPath}[${i}]`));
        } else if (options && typeof options === 'object') {
            const {content, tagName} = options;
            if (content) {
                this._content.use(content, `${optionPath}.content`);
            }
            if (tagName) {
                this._tagName.use(tagName, `${optionPath}.tagName`);
            }
        } else {
            throw new TypeError(`${optionPath} must be an array or an object.`);
        }
        return this;
    }

    content(value) {
        return this._content.test(value);
    }

    tagName(value) {
        return this._tagName.test(value);
    }
}

class Scope {
    constructor() {
        this.predicates = [];
        this.fixed = new Set();
    }

    use(rule, optionPath) {
        if (rule instanceof RegExp) {
            this.predicates.push(value => rule.test(value));
        } else if (typeof rule === 'function') {
            this.predicates.push(rule);
        } else if (typeof rule === 'string') {
            this.fixed.add(rule);
        } else {
            throw new TypeError(`${optionPath} must be a regexp, function or a string.`);
        }
    }

    test(value) {
        value = value.trim();
        return this.fixed.has(value) || this.predicates.some(test => test(value));
    }
}

module.exports = IgnoreMap;
