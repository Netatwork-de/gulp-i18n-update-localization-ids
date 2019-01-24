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
    + When the localized content or attribute is not present or empty, the localization id is removed.
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
    {tagName: 'code'}
]
```
+ ignore `<IgnoreItem>` - This can be any of the following:
    + `<array>` - An array of ignore items.
    + `<object>` - An object with the following properties:
        + content `<Rule>` - Ignore tag text content if it matches the rule.
        + tagName `<Rule>` - Ignore a tag and it's subtree if it matches the rule.
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
Optional. A function to generatea new id.
```js
idTemplate: x => `foo-${x}`

// Will produce id's like: foo-0, foo-1, ...
```
+ x `<number>` - A number that should be included in the id.
+ returns `<string>` - Any string matching `/^[a-z0-9_.-]+$/`.

### `options.keyAttribute = 't'`
Optional. Specify the attribute for storing localization keys.

### `options.encoding = 'utf8'`
Optional. Specify the encoding to use for de- and encoding files.

### `options.LocalizationKey`
Optional. Specify the class that represents a localization key.<br>
The class must implement all members of the default one located in `/lib/localization-key.js`.

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
    <h1 t="[text]foo-1">Hello World!</h1>

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
