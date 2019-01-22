'use strict'

const test = require('ava');
const {transformTest} = require('./utility/tests');

test('add new id', transformTest({
    whitelist: [{tagName: 'h1', attrs: ['foo']}]
}, `
    <h1>foo</h1>
    <h1 foo="bar"></h1>
`, `
    <h1 t="[text]t0">foo</h1>
    <h1 foo="bar" t="[foo]t1"></h1>
`));

test('reuse existing id', transformTest({
    whitelist: [{tagName: 'h1', attrs: ['foo']}]
}, `
    <h1 t="bar">foo</h1>
    <h1 foo="bar" t="[foo]baz"></h1>
`, `
    <h1 t="[text]bar">foo</h1>
    <h1 foo="bar" t="[foo]baz"></h1>
`));

test('remove empty content or non-existing attributes', transformTest({
    whitelist: [{tagName: 'h1', attrs: ['foo']}]
}, `
    <h1 t="foo"></h1>
    <h1 t="[foo]abc"></h1>
    <h1 foo="" t="[foo]baz"></h1>
`, `
    <h1></h1>
    <h1></h1>
    <h1 foo="" t="[foo]baz"></h1>
`));

test('fix content localization type', transformTest({
    whitelist: [{tagName: 'h1', attrs: ['foo'], content: 'html'}]
}, `
    <h1 t="[text]bar">foo</h1>
`, `
    <h1 t="[html]bar">foo</h1>
`));

test('fix duplicates', transformTest({
    whitelist: [{tagName: 'h1'}, {tagName: 'h2', attrs: ['bar']}]
}, `
    <h1 t="foo">a</h1>
    <h2 t="[bar]foo" bar="b"></h2>
`, `
    <h1 t="[text]foo">a</h1>
    <h2 t="[bar]t0" bar="b"></h2>
`));

test('fix attribute formatting', transformTest({
    whitelist: [{tagName: 'h1', attrs: ['foo', 'bar']}]
}, `
    <h1 t=" [ foo ] bar; test " foo="foo">a</h1>
`, `
    <h1 t="[text]test;[foo]bar" foo="foo">a</h1>
`));
