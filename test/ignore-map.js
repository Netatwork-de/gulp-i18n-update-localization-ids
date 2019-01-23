'use strict';

const test = require('ava');
const IgnoreMap = require('../lib/ignore-map');

test('ignore content (regexp)', t => {
    const ignore = new IgnoreMap().use({
        content: /foo/
    });
    t.true(ignore.content('foo bar'));
    t.false(ignore.content('bar baz'));
});

test('ignore content (fixed)', t => {
    const ignore = new IgnoreMap().use({
        content: 'foo bar'
    });
    t.true(ignore.content('foo bar'));
    t.false(ignore.content('foo bar baz'));
});

test('ignore content (function)', t => {
    const ignore = new IgnoreMap().use({
        content: v => v === '42'
    });
    t.true(ignore.content('42'));
    t.false(ignore.content('foo'));
});

test('option normalization & validation', t => {
    const ignore = new IgnoreMap().use({
        use: [
            {content: 'foo'}
        ]
    });
    t.true(ignore.content('foo'));
    t.false(ignore.content('bar'));

    t.throws(() => ignore.use(42));
    t.throws(() => ignore.use({content: 42}));
});
