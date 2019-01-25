'use strict';

function mergeIgnore(a, b) {
    return a === undefined ? b : (b === undefined ? a : [a, b]);
}

module.exports = (defaults, options) => {
    const merged = {
        whitelist: [
            ...(defaults.whitelist || []),
            ...(options.whitelist || [])
        ]
    };

    const ignore = mergeIgnore(defaults.ignore, options.ignore);
    if (ignore !== undefined) {
        merged.ignore = ignore;
    }

    for (const key of ['emit', 'idTemplate', 'keyAttribute', 'encoding', 'LocalizationKey']) {
        if (options[key] !== undefined) {
            merged[key] = options[key];
        } else if (defaults[key] !== undefined) {
            merged[key] = defaults[key];
        }
    }

    return merged;
};
