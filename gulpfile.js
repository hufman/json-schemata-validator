var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var amdOptimize = require('amd-optimize');
var uglify = require('gulp-uglify');
var eventStream = require('event-stream');
var order = require('gulp-order');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('bundle', function() {
	// produce the js
	return eventStream.merge(
	  gulp.src('bower_components/almond/almond.js'),
	  gulp.src(['lib/*.js','app/*.js','app/**/*.js'])
	  .pipe(amdOptimize('../app/main', {
	    'baseUrl':'lib'
	  }))
	  .pipe(concat('main.js'))
	)
	.pipe(order(['**/almond.js', '**/main.js']))
	.pipe(concat('main.js'))
	//.pipe(uglify())
	.pipe(gulp.dest('dist'));
});

gulp.task('less', function() {
	// produce the css
	return gulp.src(['app/*.less','lib/bootstrap.min.css'])
	.pipe(sourcemaps.init())
	.pipe(less())
	.pipe(minifyCSS())
	.pipe(concat('app.css'))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist'));
});

gulp.task('default', ['bundle', 'less'], function() {
	gulp.src('index.prod.html')
	.pipe(rename('index.html'))
	.pipe(gulp.dest('dist'))
});
