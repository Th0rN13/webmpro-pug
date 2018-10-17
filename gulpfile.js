/**
 * Modules
 */
const gulp          = require('gulp'),
      del           = require('del'),
      path          = require('path');
      pug           = require('gulp-pug'),
      notify        = require('gulp-notify'),
      browserSync   = require('browser-sync').create(),
      svgmin        = require('gulp-svgmin'),
      cheerio       = require('gulp-cheerio'),
      replace       = require('gulp-replace'),
      sourcemaps    = require('gulp-sourcemaps'),
      autoprefixer  = require('gulp-autoprefixer'),
      rename        = require('gulp-rename'),
      sass          = require('gulp-sass'),
      imagemin      = require('gulp-imagemin'),
      gulpWebpack   = require('gulp-webpack'),
      webpack       = require('webpack'),
      webpackConfig = require('./webpack.config.js')
      svgstore      = require('gulp-svgstore');
/**
 * Project paths
 */
const BUILD = './build';      
const SRC = './src';   
const PATH = {
    scss: {
        build: BUILD + '/css',
        src: SRC + '/scss/**/*.scss'
    },
    templates: {
        build: BUILD,
        src: SRC + '/templates/pages/*.pug',
        watch: SRC + '/templates/**/*.pug'
    },
    scripts: {
        build: BUILD + '/scripts',
        src: SRC + '/scripts/*.js',
        watch: SRC + '/scripts/**/*.js'
    },
    images: {
        build: BUILD + '/images',
        src: SRC + '/images/**/*.{png,jpg}'
    },
    SVGIcons: {
        build: BUILD + '/images/sprite',
        src: SRC + '/images/icons/*.svg'
    },
    fonts: {
        build: BUILD + '/fonts',
        src: SRC + '/fonts/**/*.*'
    }
};

/**
 * Modules options
 */
const autoprefixerOptions = {
    browsers: [
        'last 3 version',
        '> 1%',
        'ie 8',
        'ie 9',
        'Opera 12.1'
    ]
}
/**
 * =======================================================
 * TASKS
 * =======================================================
 *
 * Clean Build folder
 */
function clean() {
    return del(BUILD);
}

/**
 * SVG Sprite Build task
 */
function SVGSpriteBuild() {
    return gulp
        .src(PATH.SVGIcons.src)
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(rename({
            basename: "mySprite",
            suffix: ".min",
          }))
        .pipe(gulp.dest(PATH.SVGIcons.build));
}

/**
 * Pug templates compiler task
 */
function templates() {
    return gulp.src(PATH.templates.src)
    .pipe(pug({ pretty: true }))
    .on('error', notify.onError(function(error) { return { title: 'Pug', message:  error.message}}))
    .pipe(gulp.dest(PATH.templates.build))
    .pipe(browserSync.stream());
}

/**
 * Fast scss compiler task 
 */
function styles() {
    return gulp.src(PATH.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', notify.onError(function(error) { return { title: 'Sass', message:  error.message}}))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(PATH.scss.build))
        .pipe(browserSync.stream());
}

/**
 * Task for compile scss files whith autoprefixer module.
 * Only for deployment (3 time longer compile unlike "styles" task)
 */
function autoPrefStyles() {
    return gulp.src(PATH.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', notify.onError(function(error) { return { title: 'Sass', message:  error.message}}))
        .pipe(autoprefixer({autoprefixerOptions}))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(PATH.scss.build))
        .pipe(browserSync.stream());
}

/**
 * Coping images to build folder
 */
function copyImages() {
    return gulp.src(PATH.images.src)
          .pipe(gulp.dest(PATH.images.build));
}

/**
 * Coping fonts to build folder
 */
function copyFonts() {
    return gulp.src(PATH.fonts.src)
          .pipe(gulp.dest(PATH.fonts.build));
}

/**
 * Useles module.
 * i'll copy pictures after "tinypng.com" compressed.
 * gulp-tinypng module require service key
 */
function compress() {
	return gulp.src(PATH.images.src)
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 5
        }))
		.pipe(gulp.dest(PATH.images.build));
}

/**
 * Dev server
 */
function server() {
    browserSync.init({
        server: {
            baseDir: BUILD   // может понадобиться + '/'
        },
        open: false   
    });
    browserSync.watch([ BUILD + '/**/*.*'], browserSync.reload);
}

/**
 * Webpack script compile task
 */
function scripts() {
    return gulp.src(PATH.scripts.src)
        .pipe(gulpWebpack(webpackConfig, webpack))
        // .on('error', notify.onError(function(error) { return { title: 'Scripts', message:  error.message}}))
        .pipe(gulp.dest(PATH.scripts.build));
}

/**
 * Watch task
 */
function watch() {
    gulp.watch(PATH.templates.watch, templates);
    gulp.watch(PATH.scss.src, styles);
    gulp.watch(PATH.images.src, copyImages);
    gulp.watch(PATH.SVGIcons.src, SVGSpriteBuild);
    gulp.watch(PATH.scripts.watch, scripts);
    gulp.watch(PATH.fonts.src, copyFonts);
}

/**
 * Exporting gulp tasks
 */
exports.clean = clean;
exports.SVGSpriteBuild = SVGSpriteBuild;
exports.templates = templates;
exports.styles = styles;
exports.autoPrefStyles = autoPrefStyles;
exports.copyImages = copyImages;
exports.compress = compress;
exports.watch = watch;
exports.scripts = scripts;
exports.copyFonts = copyFonts;

/**
 * Gulp tasks
 */
gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        scripts,
        templates,
        styles,
        // autoPrefStyles,
        SVGSpriteBuild,
        copyImages,
        copyFonts),
    gulp.parallel(watch, server)
))

gulp.task('build', gulp.series(
    clean,
    gulp.parallel(
        scripts,
        templates,
        autoPrefStyles,
        SVGSpriteBuild,
        copyImages,
        copyFonts)
))




