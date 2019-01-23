'use strict';

/*
    Utility for creating simple object transform streams
    that support write callbacks that return promises.
*/

const through = require('through2');
const PluginError = require('plugin-error');
const {name} = require('../package.json');

function wrapAsyncWriteCallback(handler) {
    return function (chunk, enc, cb) {
        handler.call(this, chunk, enc, cb).then(() => cb(), err => {
            this.emit('error', new PluginError(name, err));
            cb();
        });
    };
}

module.exports = handler => through.obj(wrapAsyncWriteCallback(handler));
