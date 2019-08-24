'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var css_sorting = require('postcss-sorting');
var csso = require('gulp-csso');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');

var imagemin = require('gulp-imagemin');
var imgCompress  = require('imagemin-jpeg-recompress');
var webp = require('gulp-webp');

var server = require('browser-sync').create();
var run = require('run-sequence');

var rename = require('gulp-rename');
var del = require('del');
var dir = 'docs';

gulp.task('css', () =>
  gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      css_sorting()
    ]))
    .pipe(gulp.dest(dir + '/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(dir + '/css'))
    .pipe(server.stream())
);

gulp.task('html', () =>
  gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(dir))
);

gulp.task('images', () =>
  gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imgCompress({
        loops: 6,
        min: 70,
        max: 90,
        quality: 'high'
      }),
      imagemin.gifsicle(),      
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(dir + '/img'))
);

gulp.task('webp', () =>
  gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(dir + '/img'))
);

gulp.task('copy', () =>
  gulp.src([
      'source/fonts/**',
      'source/img/**',
      'source/js/**'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest(dir))
);

gulp.task('clean', () =>
  del(dir)
);

gulp.task('server', function () {
  server.init({
    server: dir + '/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/img/**/*', gulp.series('images'));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/*.html', gulp.series('html')).on('change', server.reload);
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'images',
  'webp',
  'css',
  'html')
);