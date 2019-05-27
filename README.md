# gulp-i18n-update-localization-ids
[![Build Status](https://travis-ci.com/Netatwork-de/gulp-i18n-update-localization-ids.svg?branch=master)](https://travis-ci.com/Netatwork-de/gulp-i18n-update-localization-ids)
[![Coverage Status](https://coveralls.io/repos/github/Netatwork-de/gulp-i18n-update-localization-ids/badge.svg?branch=master)](https://coveralls.io/github/Netatwork-de/gulp-i18n-update-localization-ids?branch=master)
[![Npm Version](https://img.shields.io/npm/v/gulp-i18n-update-localization-ids.svg) ![Npm License](https://img.shields.io/npm/l/gulp-i18n-update-localization-ids.svg)](https://npmjs.org/package/gulp-i18n-update-localization-ids)

Gulp task for updating i18n localization ids in html files.
```bash
npm i -D gulp-i18n-update-localization-ids
```

<br>

# Usage
```js
const i18nUpdateLocalizationIds = require('gulp-i18n-update-localization-ids');

const task = i18nUpdateLocalizationIds({
    // ...options...
});
```
The task is a transform stream that processes each file and emits updated files:
+ For each tag that is whitelisted:
    + It is ensured that localizable content and attributes have unique id's by...
        + ...using existing ids,...
        + ...regererating duplicates ids (per file)...
        + ...or adding missing ids.
    + When a localized attribute is not present, the localization id is removed.
+ Throw an error if a non-whitelisted tag is already localized or has text content.
+ Throw an error if a tag contains both text and non-text content.

### `options.whitelist`
**This option is required.**<br>
It defines a whitelist of tags and attributes that will be localized.

```js
whitelist: [
    {tagName: 'h1'},
    {tagName: 'img', attrs: ['alt']},
    {tagName: 'custom-elem', attrs: ['title', 'subtitle'], content: 'html'}
]
```
+ whitelist `<array>` - An array that contains objects with the following properties:
    + tagName `<string>` - The tag name.
    + attrs `<iterable>` - An iterable of attribute names to localize.
    + content - Specify how tag content is localized:
        + `'html'` - Localize content as html.
        + `'text'` - Localize content as text. *This is the default if tagName does **not** contain a hyphen.*
        + `false` - Don't localize content. *This is the default if tagName contains a hyphen.*

### `options.ignore`
Optional. Specify what parts of a html fragment are ignored.<br>
Matching parts will not be modified or checked against errors.
```js
ignore: [
    // Ignore content that matches "ignore me":
    {content: 'ignore me'},

    // Ignore content like "${foo.bar}":
    {content: v => v.startsWith('${') && v.endsWith('}')},

    // Ignore <code> tags and all children:
    {tagName: 'code'},

    // Ignore attributes that contain aurelia-like interpolation:
    {attr: v => /\$\{[^\}]+\}/}
]
```
+ ignore `<IgnoreItem>` - This can be any of the following:
    + `<array>` - An array of ignore items.
    + `<object>` - An object with the following properties:
        + content `<Rule>` - Ignore tag text content if it matches the rule.
        + tagName `<Rule>` - Ignore a tag and it's subtree if it matches the rule.
        + attr `<Rule>` - Ignore attributes if the value matches the rule. No `t` attributes will created for ignored attributes and they will not be modified or removed.
+ `<Rule>` can be one of the following:
    + `<string>` - If the value matches the specified one.
    + `<function>` - If the function returns true for the value.
    + `<RegExp>` - If the value matches the specified regexp. *This is not recommended!*

### `options.emit`
Optional. Control when to emit output files.
```js
emit: 'always'
```
+ `'always'` - **Default.** Emit always.
+ `'onChangeOnly'` - Emit only if the file was modified by the plugin. *Choose this value, if you are using this plugin to overwrite files that you are currently working with.*

### `options.idTemplate = x => 't' + x`
Optional. A function to generate a new id. It will be automatically ensured that the generated id is unique for the target file.
```js
idTemplate: (x, file) => `foo-${x}`

// Will produce id's like: foo-0, foo-1, ...
```
+ x `<number>` - A number that should be included in the id.
+ file `<Vinyl>` - The input file.
+ knownIds `<Set>` - A set of ids that are known for that input file.
+ returns `<string>` - Any string matching `/^[a-z0-9_.-]+$/`.

In addition, an id template can have a function that is called for every processed file after it has been scanned and before new ids are generated. This is internally used by the `prefixFilename` template to avoid using prefixes that have been used in previous files.
```js
function template(x, file, knownIds) { ... }

template.onFile = (file, knownIds) => {
    // ...
};
```

### `options.keyAttribute = 't'`
Optional. Specify the attribute for storing localization keys.

### `options.encoding = 'utf8'`
Optional. Specify the encoding to use for de- and encoding files.

### `options.LocalizationKey`
Optional. Specify the class that represents a localization key.<br>
The class must implement all members of the default one located in `/lib/localization-key.js`.

<br>



### `prefixFilename([globalPrefixes])`
If any prefix is already used in the processed file, that prefix will be used for new ids.
Otherwise a prefix will be generated from the filename (without path and extension). If the same prefix has been used for previous files, an increasing number will be appended to the prefix.
```js
const {prefixFilename} = require('gulp-i18n-update-localization-ids');

i18nUpdateLocalizationIds({
    whitelist: [...],
    idTemplate: prefixFilename()
})
```
+ globalPrefixes `<Map>` - Optional. Provide your own empty map object to ensure prefix uniqueness across multiple plugin instances or executions. This map will be filled by the plugin while executing.

| Filename | Generated ID |
|-|-|
| `foo/bar.html` | `bar.t0` |
| `baz/bar.html` | `bar1.t0` |
| `FooBar-Baz.Example.html` | `FooBar-Baz-example.t0` |

**Warning!** There is an edge case where the same prefix could be assigned to different files:<br>
If you have a file `/b/foo.html` which already has an id `foo.t0` and you create a file `/a/foo.html`, an id `foo.t0` could be used for the new file as the prefixFilename template may not be aware of `/b/foo.html`s prefix at the time, the new file is processed. If you need to avoid this problem in a production build, you have to consume all files from the plugin output without writing to disk first and then run your actual task. Both plugin instances must share the `globalPrefixes` map.

<br>

### `mergeOptions(defaults, overrides)`
Utility for merging plugin options.
```js
const {mergeOptions} = require('gulp-i18n-update-localization-ids');

const task = i18nUpdateLocalizationIds(mergeOptions(defaults, overrides));
```
+ defaults `<object>` - Default plugin options.
+ overrides `<object>` - Plugin options to override.
+ returns `<object>` - Merged plugin options.

Options are merged as follows:
+ `whitelist` will contain all entries from defaults and overrides.
+ `ignore` will contain all ignore items from defaults and overrides.
+ all other options will be set from `overrides` or `defaults` if specified.

```js
merge({
    emit: 'onChangeOnly',
    whitelist: [ {tagName: 'foo'} ],
    ignore: {content: 'bar'}
}, {
    idTemplate: x => `foo-${x}`,
    whitelist: [ {tagName: 'bar'} ],
    ignore: [
        {content: 'foo'},
        {tagName: 'code'}
    ]
});
// will be merged to:
{
    whitelist: [
        {tagName: 'foo'},
        {tagName: 'bar'}
    ],
    ignore: [
        {content: 'bar'},
        [
            {content: 'foo'},
            {tagName: 'code'}
        ]
    ],
    emit: 'onChangeOnly',
    idTemplate: x => `foo-${x}`
}
```

<br>

# Example
The following example will watch and process your html files during development.<br/>
*You should be using an editor that reloads the file when it changes like vs code.*
```js
const gulp = require('gulp');
const i18nUpdateLocalizationIds = require('gulp-i18n-update-localization-ids');

exports.watch = () => gulp.watch(['./src/**.html'], () => {
    return gulp.src('./src/**.html')
        .pipe(i18nUpdateLocalizationIds({
            emit: 'onChangeOnly',
            whitelist: [
                {tagName: 'h1'},
                {tagName: 'img', attrs: ['alt']},
                {tagName: 'custom-elem', attrs: ['title'], content: 'html'}
            ],
            ignore: [
                {content: v => v.startsWith('${') && v.endsWith('}')}
            ],
            idTemplate: x => `foo-${x}`
        }))
        .pipe(gulp.dest('./src'));
});
```
If you run `gulp watch` and save the following file...
```html
<template>
    <h1>Hello World!</h1>

    <img t="[alt]foo-0" alt="Some image..">

    <custom-elem t="[title]foo" title="Copy"></custom-elem>
    <custom-elem t="[title]foo" title="and">paste</custom-elem>

    <h1>${example.localizedTitle}</h1>
</template>
```
...it will be transformed into this:
```html
<template>
    <h1 t="foo-1">Hello World!</h1>

    <img t="[alt]foo-0" alt="Some image..">

    <custom-elem t="[title]foo" title="Copy"></custom-elem>
    <custom-elem t="[title]foo-2;[html]foo-3" title="and">paste</custom-elem>

    <h1>${example.localizedTitle}</h1>
</template>
```

<br/>



# Development
```bash
git clone https://github.com/Netatwork-de/gulp-i18n-update-localization-ids
cd gulp-i18n-update-localization-ids

# Install dependencies:
# (this is also needed for publishing)
npm i
```

### Running Tests
```bash
# Run tests and coverage:
npm test

# Run tests and watch for changes:
npm run watch
```
