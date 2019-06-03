'use strict';

function mergeIgnore(defaults, overrides) {
    return defaults === undefined ? overrides : (overrides === undefined ? defaults : [defaults, overrides]);
}

function mergeExceptions(defaults, overrides) {
	if (defaults === undefined) {
		return overrides;
	}
	if (overrides === undefined) {
		return defaults;
	}
	return Object.assign({}, defaults, overrides);
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

	const exceptions = mergeExceptions(defaults.exceptions, overrides.exceptions);
	if (exceptions !== undefined) {
		merged.exceptions = exceptions;
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
