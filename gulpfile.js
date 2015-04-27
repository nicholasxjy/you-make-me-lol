var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-ruby-sass');
var pkg = require('./package.json');
var ngAnnotate = require('gulp-ng-annotate');

var source_dir = {
  sass: 'public/scss/',
  images: 'public/images/*'
};


var build_src = {
  js: [
    'public/lib/jquery/dist/jquery.js',
    'public/lib/bootstrap/dist/js/bootstrap.js',
    'public/js/custom-module/id3-minimized.js',
    'public/lib/angular/angular.js',
    'public/lib/angular-sanitize/angular-sanitize.js',
    'public/lib/ui-router/release/angular-ui-router.js',
    'public/lib/ng-file-upload/angular-file-upload-shim.js',
    'public/lib/ng-file-upload/angular-file-upload.js',
    'public/lib/ment.io/dist/mentio.js',
    'public/lib/ng-tags-input/ng-tags-input.js',
    'public/js/custom-module/ng-cool-noti.js',
    'public/js/custom-module/ng-cool-video.js',
    'public/js/custom-module/ng-cool-audio.js',
    'public/js/custom-module/ng-cool-components.js',
    'public/js/custom-module/ng-audio-tag.js',
    'public/js/custom-module/ng-geo.js',
    'public/js/app.js',
    'public/js/services/feed.service.js',
    'public/js/services/user.service.js',
    'public/js/filters/filters.js',
    'public/js/directives/directives.js',
    'public/js/controllers/welcome.ctrl.js',
    'public/js/controllers/auth.ctrl.js',
    'public/js/controllers/feed.ctrl.js',
    'public/js/controllers/home.ctrl.js',
    'public/js/controllers/user.ctrl.js',
    'public/js/controllers/setting.ctrl.js',
    'public/js/controllers/message.ctrl.js',
    'public/js/controllers/follow.ctrl.js',
    'public/js/controllers/followee.ctrl.js'
  ]
}


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




gulp.task('compress',['concat'],function() {
  gulp.src('public/css/*.css')
    .pipe(concat('build.css'))
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('public/build'));

  return gulp.src(build_src.js)
    .pipe(concat('build.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/build'));
})




gulp.task('default', ['concat', 'watch']);

gulp.task('build', ['compress']);
