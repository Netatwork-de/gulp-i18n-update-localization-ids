'use strict';

// TODO: Replace this test script with actual jasmine specs.

const gulp = require('gulp');
const i18nTagger = require('.');

exports.default = function() {
    return gulp.src('./dev/**.html')
        .pipe(i18nTagger())
        .pipe(gulp.dest('./out'));
};
