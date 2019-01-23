'use strict';

class IgnoreMap {
    constructor() {
        this._contentPredicates = [];
        this._contentFixed = new Set();
    }

    use(options, optionPath = 'options') {
        if (Array.isArray(options)) {
            options.forEach((child, i) => this.use(child, `${optionPath}[${i}]`));
        } else if (options && typeof options === 'object') {
            const {use, content} = options;
            if (use) {
                this.use(use, `${optionPath}.use`);
            }
            if (content) {
                if (content instanceof RegExp) {
                    this._contentPredicates.push(value => content.test(value));
                } else if (typeof content === 'function') {
                    this._contentPredicates.push(content);
                } else if (typeof content === 'string') {
                    this._contentFixed.add(content);
                } else {
                    throw new TypeError(`${optionPath}.content must be a regexp, function or a string.`);
                }
            }
        } else {
            throw new TypeError(`${optionPath} must be an array or an object.`);
        }
        return this;
    }

    content(value) {
        if (this._contentFixed.has(value)) {
            return true;
        }
        return this._contentPredicates.some(match => match(value));
    }
}

module.exports = IgnoreMap;
