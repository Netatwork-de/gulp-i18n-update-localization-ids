'use strict'

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
