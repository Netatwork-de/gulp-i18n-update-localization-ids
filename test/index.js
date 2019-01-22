'use strict'

const test = require('ava');
const transformFile = require('./utility/transform-file');

test('add new id', async t => {
    t.is(await transformFile({
        whitelist: [
            {tagName: 'h1'}
        ]
    }, `<h1>foo</h1>`), '<h1 t="[text]t0">foo</h1>');
});
