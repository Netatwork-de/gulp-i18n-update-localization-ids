'use strict';

/*
    Get the contents of a vinyl instance as a string.
    Supports:
        + Buffer
        + ReadableStream
        + null (returns empty string)
*/

const {Readable} = require('stream');
const PluginError = require('plugin-error');
const {name} = require('../package.json');

module.exports = async (file, encoding = 'utf8') => {
    if (file.isBuffer()) {
        return file.contents.toString(encoding);
    }
    if (file.isStream()) {
        return new Promise((resolve, reject) => {
            let data = '';
            file.contents.setEncoding(encoding);
            file.contents
                .on('data', chunk => {
                    data += chunk;
                })
                .on('error', reject)
                .on('end', () => {
                    resolve(data)
                });
        });
    }
    if (!file.contents) {
        return '';
    }
    throw new TypeError(`Contents of ${file.inspect()} must be available as a buffer or a stream.`);
};
