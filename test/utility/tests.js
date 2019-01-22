'use strict';

const transformFile = require('./transform-file');

function transformTest(options, input, output) {
    return async t => t.is(await transformFile(options, input), output);
}

function transformFailsTest(options, input, match) {
    return async t => {
        const err = await t.throwsAsync(transformFile(options, input));
        if (match instanceof RegExp) {
            if (!match.test(err.message || String(err))) {
                throw err;
            }
        } else {
            if (!match(err)) {
                throw err;
            }
        }
    }
}

module.exports = {
    transformTest,
    transformFailsTest
};
