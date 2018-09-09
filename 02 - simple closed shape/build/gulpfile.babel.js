let browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    del = require('del'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    minify = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    open = require('gulp-open');

// Define folders
const folders = {
    css: '../css',
    js: '../js',
    core: '../../core',
    dist: '../dist'
}

// Define globs
const globs = {
    css: folders.css + '/**/*.css',
    js: folders.js + '/**/*.js',
    core: folders.core + '/**/*.js',
    dist: folders.dist + '/**/*'
};


//=============
//  CLEAN
//=============
gulp.task('clean', () => {
    return del(globs.dist, {
        force: true
    });
});


//=============
//  BUILD
//=============
// Build CSS
gulp.task('build:css', () => {
    return gulp.src(globs.css)
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(gulp.dest(folders.dist))
        .pipe(connect.reload());
});

// Build JS
gulp.task('build:js', () => {
    var b = browserify({
        entries: folders.js + '/entry.js',
        debug: true
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        // .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest(folders.dist))
        .pipe(connect.reload());
});

// Build all
gulp.task('build', ['clean', 'build:css', 'build:js']);


//=============
//  WATCH
//=============
gulp.task('watch', () => {
    gulp.watch(globs.css, ['build']);
    gulp.watch(globs.js, ['build']);
    gulp.watch(globs.core, ['build']);
    gulp.watch('../**/*.html', ['build']);
});


//=============
//  SERVE
//=============
gulp.task('serve', () => {
    connect.server({
        root: '../',
        port: '8080',
        livereload: true
    });
});

gulp.task('open', () => {
    return gulp.src('../index.html')
        .pipe(open({
            uri: 'http://localhost:8080'
        }));
});


//=============
//  DEFAULT
//=============
gulp.task('default', ['build', 'serve', 'open', 'watch']);