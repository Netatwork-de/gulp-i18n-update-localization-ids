'use strict';

const PluginError = require('plugin-error');
const colors = require('ansi-colors');
const log = require('fancy-log');
const {name} = require('../package.json');

module.exports = class DomRelatedError extends PluginError {
    constructor(vinyl, node, message) {
        const info = node.sourceCodeLocation;
        super(name, `${message} (${vinyl.path} at ln=${info.startLine}, col=${info.startCol})`);
	}

	/**
	 * Emit this error based on the specified configuration.
	 * @param {'throw' | 'warn' | 'ignore'} behaviour The configured behaviour. Default is `'throw'`
	 */
	emit(behaviour = 'throw') {
		switch (behaviour) {
			case 'warn':
				log.warn(colors.yellow(this.message));
				break;

			case 'ignore':
				break;

			default:
				throw this;
		}
	}
};
