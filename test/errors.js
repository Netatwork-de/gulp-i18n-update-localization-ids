'use strict';

const test = require('ava');
const log = require('fancy-log');
const colors = require('ansi-colors');
const {transformTest, transformFailsTest} = require('./utility/tests');
const DomRelatedError = require('../lib/dom-related-error');

test('html documents', transformFailsTest({
    whitelist: []
}, `<!DOCTYPE html>
<html>
    <head><title></title></head>
    <body></body>
</html>`, /not.*supported/i));

test('non-whitelisted tag has text content', transformFailsTest({
    whitelist: []
}, `
    <h1>Foo</h1>
`, /tag has text content/i));

test('non-whitelisted tag has text content (ignore)', transformTest({
	whitelist: [],
	exceptions: {
		illegalContent: 'ignore'
	}
}, `
	<h1>Foo</h1>
`, `
	<h1>Foo</h1>
`));

test('non-whitelisted tag is already localized', transformFailsTest({
    whitelist: []
}, `
    <h1 t="foo"></h1>
`, /tag (has.*attribute)|(is.*localized)/i));

test('non-whitelisted tag is already localized (ignore)', transformTest({
	whitelist: [],
	exceptions: {
		illegalAttribute: 'ignore'
	}
}, `
	<h1 t="foo"></h1>
`, `
	<h1 t="foo"></h1>
`));

test('non-whitelisted attribute is already localized', transformFailsTest({
    whitelist: [{tagName: 'h1'}]
}, `
    <h1 t="[foo]baz" foo="bar"></h1>
`, /attribute.*localized/i));

test('non-whitelisted attribute is already localized (ignore)', transformTest({
	whitelist: [{tagName: 'h1'}],
	exceptions: {
		illegalAttribute: 'ignore'
	}
}, `
	<h1 t="[foo]baz" foo="bar"></h1>
`, `
	<h1 t="[foo]baz" foo="bar"></h1>
`));

test('non-whitelisted content is already localized', transformFailsTest({
    whitelist: [{tagName: 'h1', content: false}]
}, `
    <h1 t="foo">Hello World</h1>
`, /content.*localized/i));

test('non-whitelisted content is already localized (ignore)', transformTest({
	whitelist: [{tagName: 'h1', content: false}],
	exceptions: {
		illegalContent: 'ignore'
	}
}, `
	<h1 t="foo">Hello World</h1>
`, `
	<h1 t="foo">Hello World</h1>
`));

test('non-whitelisted content (html) is already localized (ignore)', transformTest({
	whitelist: [{tagName: 'h1', content: false}],
	exceptions: {
		illegalContent: 'ignore'
	}
}, `
	<h1 t="[html]foo">Hello World</h1>
`, `
	<h1 t="[html]foo">Hello World</h1>
`));

test('mixed content', transformFailsTest({
    whitelist: [{tagName: 'h1'}]
}, `
    <h1>foo<div></div></h1>
`, /text and non-text/));

test('exception configuration', t => {
	function createDummyError() {
		return new DomRelatedError({
			path: 'vinyl'
		}, {
			sourceCodeLocation: {
				startLine: 42,
				startCol: 7
			}
		}, 'dummy');
	}	

	t.throws(() => createDummyError().emit());
	t.throws(() => createDummyError().emit('throw'));

	const warnings = [];
	const oldWarn = log.warn;
	try {
		log.warn = (...msg) => {
			warnings.push(msg);
		};
		createDummyError().emit('warn');
		t.deepEqual(warnings, [[colors.yellow('dummy (vinyl at ln=42, col=7)')]]);

		log.warn = () => t.fail();
		createDummyError().emit('ignore');

	} finally {
		log.warn = oldWarn;
	}
});
