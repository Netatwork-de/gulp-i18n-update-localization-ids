'use strict';

const path = require('path');

module.exports = (innerTemplate = x => 't' + x, usedNames = new Map()) => {
    if (typeof innerTemplate !== 'function') {
        throw new TypeError('innerTemplate must be undefined or a function.');
    }
    if (!(usedNames instanceof Map)) {
        throw new TypeError('usedNames must be undefined or a Map instance.');
    }

    return (x, file) => {
        const name = path.basename(file.path, path.extname(file.path))
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
            .replace(/[^a-z]/ig, '-');

        let tag = 0;
        function taggedName() {
            return `${name}${tag ? tag : ''}`;
        }
        while (usedNames.has(taggedName()) && usedNames.get(taggedName()) !== file.path) {
            tag++;
        }
        usedNames.set(taggedName(), file.path);

        return taggedName() + '-' + innerTemplate(x, file);
    };
};
