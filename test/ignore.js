'use strict';

const test = require('ava');
const {transformTest} = require('./utility/tests');

test('content', transformTest({
    whitelist: [{tagName: 'h1'}],
    ignore: {content: 'foo'}
}, `
    <h1>foo</h1>
    <h1>bar</h1>
    <p>foo</p>
`, `
    <h1>foo</h1>
    <h1 t="[text]t0">bar</h1>
    <p>foo</p>
`));

test('tagName', transformTest({
    whitelist: [{tagName: 'h1'}],
    ignore: {tagName: 'div'}
}, `
    <div>
        foo
        <h1>bar</h1>
    </div>
    <h1>foo</h1>
`, `
    <div>
        foo
        <h1>bar</h1>
    </div>
    <h1 t="[text]t0">foo</h1>
`));
