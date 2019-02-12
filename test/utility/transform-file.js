'use strict';

const Vinyl = require('vinyl');
const path = require('path');
const i18nUpdateLocalizationIds = require('../..');
const contentsToString = require('../../lib/contents-to-string');

const basePath = path.resolve(__dirname, '../data');
const virtualFilename = path.resolve(basePath, 'virtual.html');

module.exports = (options, input) => new Promise((resolve, reject) => {
    let output;
    const stream = i18nUpdateLocalizationIds(options);
    stream.on('error', reject);
    stream.on('data', outputFile => {
        if (output !== undefined) {
            reject(new Error('Multiple output files were received from plugin.'));
        }
        output = contentsToString(outputFile);
    });
    stream.on('end', () => {
        if (output === undefined) {
            reject(new Error('Output was not received from plugin.'));
        } else {
            resolve(output);
        }
    });
    stream.write(input instanceof Vinyl ? input : new Vinyl({
        base: basePath,
        path: virtualFilename,
        contents: Buffer.from(input)
    }));
    stream.end();
});
