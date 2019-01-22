'use strict';

const test = require('ava');
const {transformTest, transformFailsTest} = require('./utility/tests');

test('idTemplate', transformTest({
    whitelist: [{tagName: 'h1'}],
    idTemplate: x => `foo-${x}`
}, `
    <h1>Hello World!</h1>
`, `
    <h1 t="[text]foo-0">Hello World!</h1>
`));

test('idTemplate (return invalid id)', transformFailsTest({
    whitelist: [{tagName: 'h1'}],
    idTemplate: x => 'no!'
}, `
    <h1>foo</h1>
`, /idtemplate.*invalid id/i));

test('idTemplate (return no id)', transformFailsTest({
    whitelist: [{tagName: 'h1'}],
    idTemplate: x => 42
}, `
    <h1>foo</h1>
`, /idtemplate.*invalid id/i));

test('disallow non-fragments', transformFailsTest({
    whitelist: []
}, `<!DOCTYPE html>
<html>
</html>`, /html fragments/i));

test('assert formatting', transformFailsTest({
    whitelist: []
}, `<div foo="bar"bar="baz"></div>`, /formatting/i));

test('ignore formatting', transformTest({
    whitelist: [],
    assertFormatting: false
}, `<div foo="bar"bar="baz"></div>`, `<div foo="bar" bar="baz"></div>`));
