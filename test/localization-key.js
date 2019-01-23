'use strict';

const test = require('ava');
const LocalizationKey = require('../lib/localization-key');
const DomRelatedError = require('../lib/dom-related-error');
const createDomUtility = require('../lib/dom');

test('set attribute-id-pair', t => {
    const key = new LocalizationKey();
    key.set('foo', 'bar');
    t.is(key.get('foo'), 'bar');
});

test('set invalid data', t => {
    const key = new LocalizationKey();
    t.throws(() => key.set(42, 'bar'));
    t.throws(() => key.set('bar', 42));
});

test('set html/text content', t => {
    const key = new LocalizationKey();
    key.set('html', 'foo');
    t.true(key.has('html'));
    key.set('text', 'bar');
    t.false(key.has('html'));
    t.is(key.get('text'), 'bar');
});

test('get set of ids', t => {
    const key = new LocalizationKey([
        ['foo', 'bar'],
        ['bar', 'bar'],
        ['baz', 'baz']
    ]);
    t.deepEqual(key.ids(), new Set(['bar', 'baz']));
});

test('get map of id/attribute pairs', t => {
    const key = new LocalizationKey([
        ['foo', 'bar'],
        ['bar', 'bar'],
        ['baz', 'baz']
    ]);
    t.deepEqual(key.mapIds(), new Map([
        ['bar', ['foo', 'bar']],
        ['baz', ['baz']]
    ]));
});

test('format', t => {
    const key = new LocalizationKey([
        ['foo', 'bar'],
        ['bar', 'bar'],
        ['baz', 'baz']
    ]);
    t.is(key.format(), '[foo,bar]bar;[baz]baz');
});

test('parse', t => {
    t.is(LocalizationKey.parse('').format(), '');
    t.is(LocalizationKey.parse('bar').format(), '[text]bar');
    t.is(LocalizationKey.parse('[foo]bar').format(), '[foo]bar');
    t.is(LocalizationKey.parse(' [ foo ] bar ').format(), '[foo]bar');
    t.is(LocalizationKey.parse('[foo, baz ] bar ').format(), '[foo,baz]bar');
    t.is(LocalizationKey.parse('[foo]bar ; [bar] baz').format(), '[foo]bar;[bar]baz');
    t.throws(() => LocalizationKey.parse('foo!'));
    t.throws(() => LocalizationKey.parse('[foo]bar;[foo]baz'));
});

test('parse from dom', t => {
    const domUtility = createDomUtility();

    t.is(LocalizationKey.fromDom(domUtility, {}, {}).format(), '');
    t.is(LocalizationKey.fromDom(domUtility, {}, {attrs: [{name: 't', value: 'foo'}]}).format(), '[text]foo');

    const err = t.throws(() => {
        LocalizationKey.fromDom(domUtility, {path: '/foo'}, {
            sourceCodeLocation: {
                startLine: 7,
                startCol: 42
            },
            attrs: [
                {name: 't', value: 'foo!'}
            ]
        });
    });
    t.true(err instanceof DomRelatedError);
    t.true(/parse.*7.*42/i.test(err.message));
});
