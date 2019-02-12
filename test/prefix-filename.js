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
    <div t="[text]foo-bar-t0">foo</div>
    <div t="[text]foo-bar-t1">bar</div>
`));

test('multiple files', async t => {
    const template = prefixFilename()
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate: template
    }, file('foo/bar.html', `<div>foo</div>`), `<div t="[text]bar-t0">foo</div>`)(t);
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate: template
    }, file('baz/bar.html', `<div>foo</div>`), `<div t="[text]bar1-t0">foo</div>`)(t);
    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate: template
    }, file('baz/bar.html', `<div>foo</div>`), `<div t="[text]bar1-t0">foo</div>`)(t);
});

test('custom inner template', transformTest({
    whitelist: [{tagName: 'div'}],
    idTemplate: prefixFilename(x => `${x}-bar`)
}, file('foo.html', `<div>foo</div>`), `<div t="[text]foo-0-bar">foo</div>`));

test('option validation', t => {
    prefixFilename(() => 'foo');
    prefixFilename(undefined, new Map());
    t.throws(() => prefixFilename(42));
    t.throws(() => prefixFilename(undefined, 42));
});
