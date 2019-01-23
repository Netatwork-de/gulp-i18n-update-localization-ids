'use strict';

const test = require('ava');
const {Readable} = require('stream');
const contentsToString = require('../lib/contents-to-string');

const SAMPLE_CONTENT = 'Hello World!';

test('buffer', async t => {
    t.is(await contentsToString({
        contents: Buffer.from(SAMPLE_CONTENT),
        isBuffer: () => true
    }), SAMPLE_CONTENT);
});

test('readable stream', async t => {
    const stream = new Readable();
    stream.push(SAMPLE_CONTENT);
    stream.push(null);

    t.is(await contentsToString({
        contents: stream,
        isBuffer: () => false,
        isStream: () => true
    }), SAMPLE_CONTENT);
});

test('readable stream error', async t => {
    const stream = new Readable({
        read() {
            this.destroy(new Error('test'));
        }
    });
    const err = await t.throwsAsync(contentsToString({
        contents: stream,
        isBuffer: () => false,
        isStream: () => true
    }));
    t.is(err.message, 'test');
});

test('empty/no content', async t => {
    t.is(await contentsToString({
        isBuffer: () => false,
        isStream: () => false
    }), '');
});

test('unsupported content', async t => {
    const err = await t.throwsAsync(contentsToString({
        isBuffer: () => false,
        isStream: () => false,
        contents: 'foo',
        inspect: () => '<foo>'
    }));
    t.true(/contents.*foo/i.test(err.message));
});