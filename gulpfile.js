/*

Visual representation of this gulp file. It's made up of required modules and tasks, 
with each task made comprised of sub-tasks 

gulpfile.js
|
|-- requires
|
|-- default task (in terminal $ gulp)
|    |-- sass
|    |-- htmlBlockInclude
|    |-- browserSync
|    |-- watch
|
|-- git task 
|    |-- install
|    |-- git-check
|
|-- js validation task (in terminal $ gulp js-watch)
|    |-- jswatch
|    |-- jshint
|
|-- build task (in terminal $ gulp build)
     |-- clean
     |-- index-html-build
     |-- uglify
     |-- images
     |-- lib
     |-- fonts
     |-- copy-css

*/

/* REQUIRES
///////////////////////////////////////////////////////////
*/

var gulp 				= require( 'gulp' );
var gutil 				= require( 'gulp-util' );
var bower 				= require( 'bower' );
var concat 				= require( 'gulp-concat' );
var sass 				= require( 'gulp-sass' );
var minifyCss 			= require( 'gulp-minify-css' );
var rename 				= require( 'gulp-rename' );
var jshint 				= require( 'gulp-jshint' );
var stylish 			= require( 'jshint-stylish' );
var htmlreplace 		= require( 'gulp-html-replace' );
var uglify 				= require( 'gulp-uglifyjs' );
var htmlBlockInclude = require( 'gulp-file-include' );
var browserSync 		= require('browser-sync');
var clean 				= require( 'gulp-clean' );
var sh 					= require( 'shelljs' );


/* DEFAULT TASK
///////////////////////////////////////////////////////////

1. Run and complete sass and htmlBlockInclude task first
2. Then run browser sync
3. Then watch for html, css, js and image changes
4. Then reload on change

*/
gulp.task('default', [ 'browser-sync', 'watch' ]);

// Sass task
gulp.task( 'sass', function( done ) {
	gulp.src( './scss/ionic.app.scss' )
		.pipe( sass() )
		.pipe( minifyCss( {
			keepSpecialComments: 0
		} ) )
		.pipe( rename( {
			extname: '.min.css'
		} ) )
		.pipe( gulp.dest( './www_dev/css/' ) )
		.on( 'end', done );
} );

// HTML block includes task
gulp.task( 'htmlBlockInclude', function() {
	return gulp.src( [ './www_dev/templates/index.html' ] )
		.pipe( htmlBlockInclude( {
			prefix: '@@',
			basepath: '@root'
		} ) )
		.pipe( gulp.dest( './www_dev/' ) );
} );

// Browser-sync task, for local devlopment
gulp.task('browser-sync', [ 'sass', 'htmlBlockInclude' ], function () {
   var files = [
      './www_dev/index.html',
      './www_dev/css/**/*.css',
      './www_dev/imgs/**/*.png',
      './www_dev/js/**/*.js'
   ];

   browserSync.init(files, {
      server: {
         baseDir: './www_dev'
      }
   });
});

// Watch task - sass, htmlBlockInclude changes
gulp.task( 'watch', function() {
	gulp.watch( './scss/**/*.scss', [ 'sass', browserSync.reload ] );
  	gulp.watch( './www_dev/**/*.html', [ 'htmlBlockInclude', browserSync.reload ] );
} );

/* GIT TASKS
///////////////////////////////////////////////////////////

*/
gulp.task( 'install', [ 'git-check' ], function() {
	return bower.commands.install()
		.on( 'log', function( data ) {
			gutil.log( 'bower', gutil.colors.cyan( data.id ), data.message );
		} );
} );

gulp.task( 'git-check', function( done ) {
	if ( !sh.which( 'git' ) ) {
		console.log(
			'  ' + gutil.colors.red( 'Git is not installed.' ),
			'\n  Git, the version control system, is required to download Ionic.',
			'\n  Download git here:', gutil.colors.cyan( 'http://git-scm.com/downloads' ) + '.',
			'\n  Once git is installed, run \'' + gutil.colors.cyan( 'gulp install' ) + '\' again.'
		);
		process.exit( 1 );
	}
	done();
} );

/* JS VALIDATION
///////////////////////////////////////////////////////////

1. Run watch task
2. Watches for changes in js files
3. Any changes calls the jshint task, outputs to terminal

*/
// JS watch task
gulp.task( 'jswatch', function() {
	gulp.watch( './www_dev/js/**/*.js', [ 'jshint' ] );
} );

// JS hint task
gulp.task( 'jshint', function() {
	return gulp.src( './www_dev/js/**/*.js' )
		.pipe( jshint() )
		.pipe( jshint.reporter( stylish ) );
} );


/* BUILD TASK
///////////////////////////////////////////////////////////

1. Deletes all contents of 'www' folder first
2. Runs concurently the:
	- index-html-build task, in index.html removes dev js includes, replaces with singular js include
	- uglify, concat and minify js, not mangling names to keep angular js working
	- copy tasksL images, css, lib and fonts

*/
// Build task - production ready (html, js, css, img)
gulp.task( 'build', [ 'index-html-build', 'uglify', 'images', 'lib', 'fonts', 'copy-css' ]);

// Clean www folder
gulp.task( 'clean', function() {
	return gulp.src( './www/*', {
			read: false
		} )
		.pipe( clean() );
} );

// index.html build task
gulp.task( 'index-html-build', ['clean'], function() {
	return gulp.src( './www_dev/index.html' )
		.pipe( htmlreplace( {
			'js': 'js/bundle.min.js'
		} ) )
		.pipe( gulp.dest( './www/' ) );
} );

// JS concat and uglify
gulp.task( 'uglify', ['clean'], function() {
	return gulp.src( './www_dev/js/**/*.js' )
		.pipe( uglify( 'bundle.min.js', {
			mangle: false
		} ) )
		.pipe( gulp.dest( './www/js' ) )
} );

// Copy over images
gulp.task( 'images', ['clean'], function() {
	return gulp.src( [ './www_dev/img/*' ] )
		.pipe( gulp.dest( './www/img' ) );
} );

// Copy over library
gulp.task( 'lib', ['clean'], function() {
	return gulp.src( [ './www_dev/lib/ionic/js/ionic.bundle.min.js' ] )
		.pipe( gulp.dest( './www/lib/ionic/js/' ) );
} );

// Copy over fonts
gulp.task( 'fonts', ['clean'], function() {
	return gulp.src( [ './www_dev/lib/ionic/fonts/*.*' ] )
		.pipe( gulp.dest( './www/lib/ionic/fonts/' ) );
} );

// Copy over CSS
gulp.task( 'copy-css', ['clean'], function() {
	return gulp.src( [ './www_dev/css/*.css' ] )
		.pipe( gulp.dest( './www/css/' ) );
} );