'use strict';

const test = require('ava');
const {transformTest} = require('./utility/tests');
const file = require('./utility/file');
const {prefixFilename} = require('..');

test('general usage', transformTest({
    whitelist: [{tagName: 'div'}],
    idTemplate: prefixFilename()
}, file('FooBar.html', `
    <div>foo</div>
    <div>bar</div>
`), `
    <div t="FooBar.t0">foo</div>
    <div t="FooBar.t1">bar</div>
`));

test('multiple files', async t => {
    const idTemplate = prefixFilename();
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate
    }, file('foo/bar.html', `<div>foo</div>`), `<div t="bar.t0">foo</div>`)(t);
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate
    }, file('baz/bar.html', `<div>foo</div>`), `<div t="bar1.t0">foo</div>`)(t);
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate
    }, file('baz/bar.html', `<div>foo</div>`), `<div t="bar1.t0">foo</div>`)(t);
});

test('reuse existing prefix', transformTest({
    whitelist: [{tagName: 'div'}],
    idTemplate: prefixFilename()
}, file('foo.html', `
    <div t="bar.t7">foo</div>
    <div>bar</div>
`), `
    <div t="bar.t7">foo</div>
    <div t="bar.t0">bar</div>
`));

test('avoid using prefixes from previous files', async t => {
    const idTemplate = prefixFilename();
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate
    }, file('foo.html', `<div t="bar.t0">foo</div>`), `<div t="bar.t0">foo</div>`)(t);
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate
    }, file('bar.html', `<div>foo</div>`), `<div t="bar1.t0">foo</div>`)(t);
});

test('ignore unprefixed ids', transformTest({
    whitelist: [{tagName: 'div'}],
    idTemplate: prefixFilename()
}, `<div t="foo">foo</div>`, `<div t="foo">foo</div>`));

test('option validation', t => {
    prefixFilename(new Map());
    t.throws(() => prefixFilename(42));
});
