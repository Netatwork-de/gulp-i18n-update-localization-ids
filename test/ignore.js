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
    <h1 t="t0">bar</h1>
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
    <h1 t="t0">foo</h1>
`));

test('attr (add ids)', transformTest({
    whitelist: [{tagName: 'div', attrs: ['foo']}],
    ignore: {attr: 'baz'}
}, `
    <div foo="bar"></div>
    <div foo="baz"></div>
`, `
    <div foo="bar" t="[foo]t0"></div>
    <div foo="baz"></div>
`));

test('attr (remove ids)', transformTest({
    whitelist: [{tagName: 'div', attrs: ['foo']}],
    ignore: {attr: 'baz'}
}, `
    <div foo="baz" t="[foo]t0"></div>
`, `
    <div foo="baz"></div>
`));

test('t attr (update ids)', transformTest({
    whitelist: [{tagName: 'div', attrs: ['foo']}],
    ignore: {attr: 'baz'}
}, `
    <div foo="bar"></div>
    <div foo="bar" t="baz"></div>
`, `
    <div foo="bar" t="[foo]t0"></div>
    <div foo="bar" t="baz"></div>
`));

test('t attr (remove ids)', transformTest({
    whitelist: [{tagName: 'div', attrs: ['foo']}],
    ignore: {attr: 'baz'}
}, `
    <div t="baz"></div>
`, `
    <div t="baz"></div>
`));
