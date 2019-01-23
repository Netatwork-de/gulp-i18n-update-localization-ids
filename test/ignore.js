'use strict';

const test = require('ava');
const {transformTest} = require('./utility/tests');

test('content', transformTest({
    whitelist: [{tagName: 'h1'}],
    ignore: {content: 'foo'}
}, `
    <h1>foo</h1>
    <h1>bar</h1>
`, `
    <h1>foo</h1>
    <h1 t="[text]t0">bar</h1>
`));
