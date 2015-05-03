var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSquence = require('run-sequence');


// optimize images
gulp.task('images', function() {
  return gulp.src('public/images/*')
    .pipe($.changed('public/build/images'))
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('public/build/images'));
});

//browser sync
gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: 'http://localhost:3000'
  })
})

// minify js
gulp.task('minify-js', function() {
  gulp.src('public/dist/js/*.js')
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('public/build/js'));
})

//minify css
gulp.task('minify-css', function() {
  gulp.src('public/dist/css/*.css')
    .pipe($.minifyCss({keepBreaks: true}))
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('public/build/css'));
})

//copy fonts to build
gulp.task('fonts', function() {
  gulp.src('public/fonts/*.{ttf,woff,eof,eot,svg,woff2}')
    .pipe($.changed('public/build/fonts'))
    .pipe(gulp.dest('public/build/fonts'))

})

// clean build dir
gulp.task('clean:build', function(cb) {
  del([
    'public/build'
  ], cb)
})



// dist task
var source_dir = {
  sass: 'public/scss/',
  jsdev: [
    'public/lib/jquery/dist/jquery.js',
    'public/lib/bootstrap/dist/js/bootstrap.js',
    'public/js/custom-module/id3-minimized.js',
    'public/lib/angular/angular.js',
    'public/lib/angular-sanitize/angular-sanitize.js',
    'public/lib/ui-router/release/angular-ui-router.js',
    'public/lib/ng-file-upload/ng-file-upload-shim.js',
    'public/lib/ng-file-upload/ng-file-upload.js',
    'public/lib/ment.io/dist/mentio.js',
    'public/lib/ng-tags-input/ng-tags-input.js'
  ],
  jscus: [
    'public/js/custom-module/*.js',
    'public/js/app.js',
    'public/js/services/base.query.js',
    'public/js/services/*.js',
    'public/js/filters/filters.js',
    'public/js/directives/*.js',
    'public/js/controllers/*.js',
  ]
}
//concat js css
gulp.task('concat', ['sass'], function() {
  gulp.src(source_dir.jsdev)
    .pipe($.concat('common.js'))
    .pipe(gulp.dest('public/dist/js'))

  gulp.src(source_dir.jscus)
    .pipe($.concat('custom.js'))
    .pipe(gulp.dest('public/dist/js'))

  return gulp.src('public/css/*.css')
    .pipe($.concat('build.css'))
    .pipe(gulp.dest('public/dist/css'))
})

//sass task
gulp.task('sass', function() {
  return gulp.src('./public/scss/build.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      style: 'expanded'
    }))
    .on('error', $.notify.onError({
      title: 'Sass failed',
      message: 'Error compile scss'
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('public/css'))
    .pipe(reload({
      stream: true
    }))
    .pipe($.notify({
      message: 'css compiled!!!!'
    }))
});


//move fonts images for dist
gulp.task('dist:moveimage', function() {
  gulp.src('public/images/*')
    .pipe($.changed('public/dist/images'))
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('public/dist/images'));
})

gulp.task('dist:movefonts', function() {
  gulp.src('public/fonts/*.{ttf,woff,eof,eot,svg}')
    .pipe($.changed('public/dist/fonts'))
    .pipe(gulp.dest('public/dist/fonts'))
})


gulp.task('reload', function() {
  browserSync.reload();
})

gulp.task('watch', function() {
  gulp.watch('public/scss/*.scss', ['concat']);
  gulp.watch(['public/js/*.js', 'public/js/**/*.js'], ['concat']);
  gulp.watch('public/images/*',['dist:moveimage']);
  gulp.watch(['views/*.html', 'public/template/**/*.html', 'public/template/*.js'], ['reload']);
})

gulp.task('default', function(cb) {
  runSquence(
    'concat',
    'dist:moveimage',
    'dist:movefonts',
    'browser-sync',
    'watch',
    cb)
})



//build to production
gulp.task('build', function(cb) {
  runSquence(
    'clean:build',
    'concat',
    'images',
    'minify-js',
    'minify-css',
    'fonts',
    cb)
})
