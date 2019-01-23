'use strict';

const test = require('ava');
const {traverse, getAttr, setAttr, deleteAttr} = require('../lib/dom')();

test('get attr', t => {
    t.is(getAttr({}, 'foo'), undefined);
    t.is(getAttr({attrs: []}, 'foo'), undefined);
    t.is(getAttr({attrs: [{name: 'foo', value: ''}]}, 'foo'), '');
    t.is(getAttr({attrs: [{name: 'foo', value: 'bar'}]}, 'foo'), 'bar');
});

test('set attr', t => {
    const node = {attrs: []};
    setAttr(node, 'foo', 'bar');
    t.deepEqual(node.attrs, [{name: 'foo', value: 'bar'}]);

    node.attrs = [{name: 'a'}, {name: 'foo', value: 'bar'}];
    setAttr(node, 'foo', 'baz');
    t.deepEqual(node.attrs, [{name: 'a'}, {name: 'foo', value: 'baz'}]);

    t.throws(() => setAttr({}, 'foo', 'bar'));
});

test('delete attr', t => {
    const node = {attrs: [{name: 'foo', value: 'bar'}]};
    deleteAttr(node, 'bar');
    t.deepEqual(node.attrs, [{name: 'foo', value: 'bar'}]);

    t.throws(() => deleteAttr({}, 'foo'));
});

test('traverse', t => {
    t.deepEqual(Array.from(traverse({})), [{}]);
    t.deepEqual(Array.from(traverse({nodeName: '#comment'})), []);

    const dom = {
        nodeName: '#documentFragment',
        childNodes: [
            {nodeName: 'div'}
        ]
    };
    t.deepEqual(Array.from(traverse(dom)), [
        dom,
        dom.childNodes[0]
    ]);
});
