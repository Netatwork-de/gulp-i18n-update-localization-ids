'use strict';

const test = require('ava');
const {transformTest} = require('./utility/tests');
const file = require('./utility/file');
const {prefixFilename} = require('..');

test('same files', async t => {
    const globallyKnownIds = new Map();

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('foo.html', `<div>foo</div>`), `<div t="[text]t0">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('foo.html', `<div>foo</div>`), `<div t="[text]t0">foo</div>`)(t);
});

test('different files', async t => {
    const globallyKnownIds = new Map();

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('foo.html', `<div>foo</div>`), `<div t="[text]t0">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('bar.html', `<div>foo</div>`), `<div t="[text]t1">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('bar.html', `<div>foo</div>`), `<div t="[text]t1">foo</div>`)(t);
});

test('reuse existing', async t => {
    const globallyKnownIds = new Map();

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('foo.html', `<div>foo</div>`), `<div t="[text]t0">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('bar.html', `<div t="[text]t0">foo</div>`), `<div t="[text]t1">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('foo.html', `<div t="[text]t0">foo</div>`), `<div t="[text]t0">foo</div>`)(t);
    
    await transformTest({
        whitelist: [{tagName: 'div'}],
        globallyKnownIds
    }, file('bar.html', `<div t="[text]t0">foo</div>`), `<div t="[text]t1">foo</div>`)(t);
});

test('with file prefix', async t => {
    const globallyKnownIds = new Map();
    const usedPrefixNames = new Map();
    const idTemplate = prefixFilename(undefined, usedPrefixNames);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate,
        globallyKnownIds
    }, file('foo/bar.html', `<div>foo</div>`), `<div t="[text]bar-t0">foo</div>`)(t);

    await transformTest({
        whitelist: [{tagName: 'div'}],
        idTemplate,
        globallyKnownIds
    }, file('bar/bar.html', `<div t="[text]bar-t0">foo</div>`), `<div t="[text]bar1-t0">foo</div>`)(t);
});
