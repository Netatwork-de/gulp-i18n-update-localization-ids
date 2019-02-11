
const test = require('ava');
const {parseFragment} = require('parse5');
const {transformTest} = require('./utility/tests');
const CustomSerializer = require('../lib/custom-serializer');

test('prevent escaping of attribute values', transformTest({
    whitelist: [{tagName: 'div'}]
}, `
    <div>foo</div>
    <div foo="a & b"></div>
`, `
    <div t="[text]t0">foo</div>
    <div foo="a & b"></div>
`));

test('prevent escaping of text node content', transformTest({
    whitelist: [{tagName: 'div'}]
}, `
    <div>foo & bar</div>
`, `
    <div t="[text]t0">foo & bar</div>
`));

test('prevent adding empty attribute values', transformTest({
    whitelist: []
}, `
    <div foo="foo" bar></div>
`, `
    <div foo="foo" bar></div>
`));

test('allow special characters in attribute names', transformTest({
    whitelist: []
}, `
    <div foo.bar="foo"></div>
`, `
    <div foo.bar="foo"></div>
`));

test('require original source', t => {
    const source = '<div></div>';
    const dom = parseFragment(source);
    new CustomSerializer(dom, {}, source);
    t.throws(() => new CustomSerializer(dom, {}));
});
