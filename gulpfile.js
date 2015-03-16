var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-ruby-sass');
var pkg = require('./package.json');


var source_dir = {
  sass: 'public/scss/',
  images: 'public/images/*'
};

var dist_dir = 'public/dist';

gulp.task('sass', function() {
  return sass(source_dir.sass)
    .on('error', function(err) {
      console.log('Error: ', err.message);
    })
    .pipe(gulp.dest(dist_dir+'/css'))
});

gulp.task('concat', ['sass'], function() {
  return gulp.src(dist_dir+'/css/*.css')
    .pipe(concat('custom.css'))
    .pipe(gulp.dest('public/css/'));
})

gulp.task('watch', function() {
  gulp.watch(source_dir.sass+'*', ['concat']);
});

gulp.task('default', ['concat', 'watch']);
