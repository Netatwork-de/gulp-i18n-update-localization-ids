'use strict';

const test = require('ava');
const {transformFailsTest} = require('./utility/tests');

test('non-whitelisted tag has text content', transformFailsTest({
    whitelist: []
}, `
    <h1>Foo</h1>
`, /tag has text content/i));

test('non-whitelisted tag is already localized', transformFailsTest({
    whitelist: []
}, `
    <h1 t="foo"></h1>
`, /tag (has.*attribute)|(is.*localized)/i));

test('non-whitelisted attribute is already localized', transformFailsTest({
    whitelist: [{tagName: 'h1'}]
}, `
    <h1 t="[foo]baz" foo="bar"></h1>
`, /attribute.*localized/i));

test('non-whitelisted content is already localized', transformFailsTest({
    whitelist: [{tagName: 'h1', content: false}]
}, `
    <h1 t="[text]foo">Hello World</h1>
`, /content.*localized/i));

test('mixed content', transformFailsTest({
    whitelist: [{tagName: 'h1'}]
}, `
    <h1>foo<div></div></h1>
`, /text and non-text/));
