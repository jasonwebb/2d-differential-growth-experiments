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
  open = require('gulp-open'),
  Stream = require('merge-stream');

// Define folders
const experiments = [
  '../01 - single line/',
  '../02 - simple closed shape/',
  '../03 - multiple shapes/',
  '../04 - SVG as input/',
  '../05 - line studies/',
  '../06 - shape studies/',
  '../07 - bounds/'
];

// Define globs
const globs = {
  css: 'css/**/*.css',
  js: 'js/**/*.js',
  dist: 'dist/**/*',
  core: '../core/**/*.js',
  allCss: [],
  allJs: ['../core/*.js'],
  allHtml: ['../index.html']
};

// Build globs for global watch tasks
for(let experiment of experiments) {
  globs.allCss.push(experiment + globs.css);
  globs.allJs.push(experiment + globs.js);
  globs.allHtml.push(experiment + 'index.html')
}


//=============
//  CLEAN
//=============

// Clean all dist/ folders in all experiments
gulp.task('clean', () => {
  for(experiment in experiments) {
    del(experiment + globs.dist, {
      force: true
    });
  }
});


//=============
//  BUILD
//=============

// Build CSS
gulp.task('build:css', () => {
  let streams = new Stream();

  for(let experiment of experiments) {
    streams.add(
      gulp.src(experiment + globs.css)
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(gulp.dest(experiment + 'dist'))
        .pipe(connect.reload())
    );
  }

  return streams;
});

// Build JS
gulp.task('build:js', () => {
  let streams = new Stream();

  for(let experiment of experiments) {
    let b = browserify({
      entries: experiment + 'js/entry.js',
      debug: true
    });
  
    streams.add(b.bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .pipe(uglify())
      .pipe(rename('app.min.js'))
      .pipe(gulp.dest(experiment + 'dist'))
      .pipe(connect.reload()));
  }
  
  return streams;
});

// Build all
gulp.task('build', ['clean', 'build:css', 'build:js']);


//=============
//  WATCH
//=============

gulp.task('watch', () => {
  gulp.watch(globs.allCss, ['build']);
  gulp.watch(globs.allJs, ['build']);
  gulp.watch(globs.allHtml, ['build']);
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