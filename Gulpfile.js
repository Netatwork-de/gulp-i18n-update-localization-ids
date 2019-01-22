'use strict';

const gulp = require('gulp');
const i18nTagger = require('.');

exports.default = function() {
    return gulp.src('./dev/in/**.html')
        .pipe(i18nTagger({
            whitelist: [
                {tagName: 'h1', attrs: ['foo']},
                {tagName: 'p', content: 'html'},
                {tagName: 'custom-elem', attrs: ['value'], content: 'text'}
            ]
        }))
        .pipe(gulp.dest('./dev/out'));
};
