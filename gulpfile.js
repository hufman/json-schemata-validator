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
var rev = require('gulp-rev-hash');

var RevAll = require('gulp-rev-all');
var awspublish = require('gulp-awspublish');

var aws = require('./aws_creds.json');
var publisher = awspublish.create(aws);
var headers = {'Cache-Control': 'max-age=315360000, no-transform, public'};

gulp.task('bundle', function() {
	// produce the js
	return eventStream.merge(
	  gulp.src('bower_components/almond/almond.js'),
	  gulp.src(['lib/*.js','app/*.js'])
	  .pipe(amdOptimize('../app/main', {
	    'baseUrl':'lib'
	  }))
	  .pipe(concat('main.js'))
	)
	.pipe(order(['**/almond.js', '**.js']))
	.pipe(concat('main.js'))
	.pipe(uglify())
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

gulp.task('static', function() {
	return gulp.src(['metaschema.json', '*.png', '*.gif'])
	.pipe(gulp.dest('dist'));
	gulp.src('examples/*')
	.pipe(gulp.dest('dist/examples'));
});

gulp.task('html', ['bundle', 'less'], function() {
	return gulp.src('index.prod.html')
	.pipe(rename('index.html'))
	.pipe(rev({assetsDir: 'dist'}))
	.pipe(gulp.dest('dist'));
});

gulp.task('dist', ['bundle', 'less', 'static', 'html'], function() {
});

gulp.task('default', ['dist'], function() {
});

gulp.task('publish', ['dist'], function() {
	var revAll = new RevAll({
		'dontRenameFile':['index.html', 'metaschema.json', 'examples/.*', '\.gif', '\.png$'],
		'dontUpdateReference':['metaschema.json', 'examples/.*', '\.gif$', '\.png$']
	});
	gulp.src('dist/**')
	.pipe(revAll.revision())
	.pipe(awspublish.gzip())
	.pipe(publisher.publish(headers))
	.pipe(publisher.cache())
	.pipe(awspublish.reporter());
});
