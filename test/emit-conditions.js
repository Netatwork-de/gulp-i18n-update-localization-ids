'use strict';

const test = require('ava');
const path = require('path');
const Vinyl = require('vinyl');
const i18nUpdateUid = require('..');

const basePath = path.resolve(__dirname, './data');
const virtualFilename = path.resolve(basePath, 'virtual.html');

const CHANGING_CONTENT = '<h1>foo</h1>';
const FINAL_CONTENT = '<h1 t="[text]bar">foo</h1>';

function emitCondition(conditionType) {
    return input => new Promise((resolve, reject) => {
        let emitted = false;
        const stream = i18nUpdateUid({
            whitelist: [{tagName: 'h1'}],
            emit: conditionType
        });
        stream.on('error', reject);
        stream.on('end', () => resolve(emitted));
        stream.on('data', () => {
            emitted = true;
        });
        stream.write(new Vinyl({
            base: basePath,
            path: virtualFilename,
            contents: Buffer.from(input)
        }));
        stream.end();
    });
}

test('onChangeOnly', async t => {
    const emits = emitCondition('onChangeOnly');
    t.true(await emits(CHANGING_CONTENT));
    t.false(await emits(FINAL_CONTENT));
});

test('always', async t => {
    const emits = emitCondition('always');
    t.true(await emits(CHANGING_CONTENT));
    t.true(await emits(FINAL_CONTENT));
});

test('validation', t => {
    t.throws(() => i18nUpdateUid({
        whitelist: [],
        emit: 'No!'
    }));
});