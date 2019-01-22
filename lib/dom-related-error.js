'use strict'

const PluginError = require('plugin-error');
const {name} = require('../package.json');

module.exports = class DomRelatedError extends PluginError {
    constructor(vinyl, node, message) {
        const info = node.sourceCodeLocation
        super(name, `${message} (${vinyl.path} at ${
            info
                ? `ln ${info.startLine}, col ${info.startCol}`
                : `???`
        })`);
    }
};