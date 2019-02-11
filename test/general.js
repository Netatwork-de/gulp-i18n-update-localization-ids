'use strict';

const test = require('ava');
const {transformTest, transformFailsTest} = require('./utility/tests');

test('no content localization', transformTest({
    whitelist: [{tagName: 'h1', content: false, attrs: ['foo']}]
}, `
    <h1 foo="bar"></h1>
`, `
    <h1 foo="bar" t="[foo]t0"></h1>
`));

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

test('remove for non-existing attributes', transformTest({
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

test('complex fragment', transformTest({
    whitelist: [
        {tagName: 'h1'},
        {tagName: 'custom-elem', attrs: ['value'], content: 'html'}
    ]
}, `<template>
    <h1>Hello World!</h1>
    <custom-elem t="[html]t0" value="foo">bar</custom-elem>
</template>`, `<template>
    <h1 t="[text]t1">Hello World!</h1>
    <custom-elem t="[html]t0;[value]t2" value="foo">bar</custom-elem>
</template>`));

test('whitelist content defaults', async t => {
    await transformTest({
        whitelist: [{tagName: 'div'}]
    }, `<div>foo</div>`, `<div t="[text]t0">foo</div>`)(t);
    await transformFailsTest({
        whitelist: [{tagName: 'custom-elem'}]
    }, `<custom-elem>foo</custom-elem>`, /not.*whitelisted/i)(t);
});
