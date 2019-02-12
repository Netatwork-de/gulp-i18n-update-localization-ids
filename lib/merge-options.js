'use strict';

function mergeIgnore(a, b) {
    return a === undefined ? b : (b === undefined ? a : [a, b]);
}

module.exports = (defaults, overrides) => {
    const merged = {
        whitelist: [
            ...(defaults.whitelist || []),
            ...(overrides.whitelist || [])
        ]
    };

    const ignore = mergeIgnore(defaults.ignore, overrides.ignore);
    if (ignore !== undefined) {
        merged.ignore = ignore;
    }

    for (const key of ['emit', 'idTemplate', 'keyAttribute', 'encoding', 'LocalizationKey']) {
        if (overrides[key] !== undefined) {
            merged[key] = overrides[key];
        } else if (defaults[key] !== undefined) {
            merged[key] = defaults[key];
        }
    }

    return merged;
};
