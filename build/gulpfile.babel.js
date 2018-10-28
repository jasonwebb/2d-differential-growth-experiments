let browserify = require('browserify'),
  gulp = require('gulp'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  del = require('del'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
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
  '../07 - bounds/',
  '../playground/'
];

// Define globs
const globs = {
  js: 'js/**/*.js',
  dist: 'dist/**/*',
  core: '../core/**/*.js',
  allJs: ['../core/*.js'],
  allHtml: ['../index.html']
};

// Build globs for global watch tasks
for(let experiment of experiments) {
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
gulp.task('build', ['clean', 'build:js']);


//=============
//  WATCH
//=============

gulp.task('watch', () => {
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