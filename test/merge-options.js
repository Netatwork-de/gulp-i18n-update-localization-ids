'use strict';

const test = require('ava');
const {mergeOptions} = require('..');

test('whitelist', t => {
    t.deepEqual(
        mergeOptions({}, {}),
        {whitelist: []}
    );
    t.deepEqual(
        mergeOptions({whitelist: ['foo']}, {}),
        {whitelist: ['foo']}
    );
    t.deepEqual(
        mergeOptions({whitelist: ['foo']}, {whitelist: ['bar', 'baz']}),
        {whitelist: ['foo', 'bar', 'baz']}
    );
});

test('ignore', t => {
    t.is(mergeOptions({}, {}).ignore, undefined);
    t.is(mergeOptions({ignore: 'foo'}, {}).ignore, 'foo');
    t.is(mergeOptions({}, {ignore: 'bar'}).ignore, 'bar');
    t.deepEqual(
        mergeOptions({ignore: 'foo'}, {ignore: 'bar'}).ignore,
        ['foo', 'bar']
    );
});

test('atomic options', t => {
    for (const key of ['emit', 'idTemplate', 'globallyKnownIds', 'keyAttribute', 'encoding', 'LocalizationKey']) {
        t.is(mergeOptions({[key]: 'foo'}, {})[key], 'foo');
        t.is(mergeOptions({}, {[key]: 'foo'})[key], 'foo');
        t.is(mergeOptions({[key]: 'foo'}, {[key]: 'bar'})[key], 'bar');
    }
});
