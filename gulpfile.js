'use strict';

var gulp            =   require('gulp'),
    sass            =   require('gulp-sass'),
    autoprefixer    =   require('gulp-autoprefixer'),
    debug           =   require('gulp-debug'),
    sourcemaps      =   require('gulp-sourcemaps'),
    rename          =   require('gulp-rename'),
    concat          =   require('gulp-concat'),
    uglify          =   require('gulp-uglify'),
    bump            =   require('gulp-bump'),
    browserify      =   require('browserify'),
    source          =   require('vinyl-source-stream'),
    streamify       =   require('gulp-streamify'),
    del             =   require('del'),
    browserSync     =   require('browser-sync').create(),
    Config          =   require('./gulpfile.config'),
    vendor          =   require('bower-files')({});

var config          =   new Config(),
    npmSettings     =   require('./package.json');

/*================================================================
    TASKS
 ================================================================*/

gulp.task("del",            clearDistFiles);
gulp.task("sass",           compileSASS);
gulp.task("js",             compileJS);
gulp.task("views",          copyHtml);
gulp.task("index",          copyIndex);
gulp.task("html",           ['index', 'views']);
gulp.task('bower-files',    bowerFiles);
gulp.task('reload-JS',      ['js'],         reloadBrowser);
gulp.task('reload-TS',      ['ts'],         reloadBrowser);
gulp.task('reload-SCSS',    ['sass'],       reloadBrowser);
gulp.task('reload-HTML',    ['html'],       reloadBrowser);
gulp.task('reload-IMG',     ['img'],        reloadBrowser);
gulp.task('watch',          ['sass', 'html', 'js'], serve);

/*================================================================
    FUNCTIONS
 ================================================================*/

function bowerFiles() {

    var vendorFiles = vendor.ext('js').files.concat(config.plugins);

    return gulp.src(vendorFiles)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.dist + 'js/'));
}

function compileJS() {
    var jsBundle = browserify(config.application).bundle();

    return jsBundle
        .pipe(source(config.application))
        .pipe(rename(npmSettings.name + '.js'))
        .pipe(gulp.dest(config.dist + 'js/'));
}

function compileSASS() {
    //TODO:Check this against browserSyncStream
    return gulp.src(config.scss)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.dist + 'css'));
}

function browserSyncStream(pipeline) {
    return browserSync == null ?
        pipeline :
        pipeline.pipe(browserSync.stream());
}

function copyHtml(){
    return gulp.src(config.html)
        .pipe(rename({
            dirname:"views/"
        }))
        .pipe(gulp.dest(config.dist));
}
function copyIndex(){
    return gulp.src(config.index)
        .pipe(gulp.dest(config.dist));
}

function serve() {

    if (browserSync != null) {
        browserSync.init({
            server: config.dist
        });
    }else{
        console.warn("Browser sync not available in your environment.");
    }
    gulp.watch(config.scss,             ['reload-SCSS']);
    gulp.watch(config.html,             ['reload-HTML']);
    gulp.watch(config.index,            ['reload-HTML']);
    gulp.watch(config.javascriptModules,['reload-JS']);
}

function reloadBrowser(){
    if (browserSync != null) {
        browserSync.reload();
    }
}

function clearDistFiles(){
    return del(config.dist + '/*', function(){});
}
