'use strict';

const path = require('path');

module.exports = (globalPrefixes = new Map()) => {
    if (!(globalPrefixes instanceof Map)) {
        throw new TypeError('globalPrefixes must be undefined or a Map instance.');
    }

    function createId(prefix, x) {
        return `${prefix}.t${x}`;
    }

    const preferredPrefixes = new Map();

    function template(x, file, knownIds) {
        const preferredPrefix = preferredPrefixes.get(file);
        if (preferredPrefix) {
            return createId(preferredPrefix, x);
        }

        const basePrefix = path.basename(file.path, path.extname(file.path)).replace(/[^a-z\-\_]/ig, '-');

        let tag = 0;
        const getPrefix = () => `${basePrefix}${tag ? tag : ''}`;
        while (globalPrefixes.has(getPrefix()) && globalPrefixes.get(getPrefix()) !== file.path) {
            tag++;
        }
        globalPrefixes.set(getPrefix(), file.path);
        return createId(getPrefix(), x);
    }

    template.onFile = (file, knownIds) => {
        const prefixes = Array.from((function * () {
            for (const knownId of knownIds) {
                const separator = knownId.indexOf('.');
                if (separator >= 0) {
                    yield knownId.slice(0, separator);
                }
            }
        })());
        for (const prefix of prefixes) {
            globalPrefixes.set(prefix, file.path);
        }
        preferredPrefixes.set(file, prefixes[0]);
    };

    return template;
};
