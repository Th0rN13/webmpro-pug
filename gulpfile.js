/**
 * Modules
 */
var gulp            = require('gulp'),
    watch           = require('gulp-watch'),
    prefixer        = require('gulp-autoprefixer'),
    uglify          = require('gulp-uglify'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    rigger          = require('gulp-rigger'),
    cssmin          = require('gulp-minify-css'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    rimraf          = require('rimraf'),
    browserSync     = require("browser-sync"),
    pug             = require('gulp-pug'),
    reload          = browserSync.reload;

    var path = {
        build: { 
            html: 'build/',
            js: 'build/js/',
            css: 'build/css/',
            img: 'build/img/',
            fonts: 'build/fonts/'
        },
        src: { 
            //html: 'src/*.html',
            pug: 'src/*.pug',
            js: 'src/js/script.js',
            style: 'src/style/style.sass',
            img: 'src/img/**/*.*', 
            fonts: 'src/fonts/**/*.*'
        },
        watch: { 
            pug: 'src/**/*.pug',
            js: 'src/js/**/*.js',
            style: 'src/style/**/*.sass',
            img: 'src/img/**/*.*',
            fonts: 'src/fonts/**/*.*'
        },
        clean: './build'
    };

    var config = {
        server: {
            baseDir: "./build"
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "FrontEnd"
    };

    gulp.task('html:build', function () {
        gulp.src(path.src.pug) //Выберем файлы по нужному пути
            .pipe(pug())
            .pipe(rigger()) //Прогоним через rigger
            .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
            .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
    });

    gulp.task('js:build', function () {
        gulp.src(path.src.js) //Найдем наш main файл
            .pipe(rigger()) //Прогоним через rigger
            .pipe(sourcemaps.init()) //Инициализируем sourcemap
            .pipe(uglify()) //Сожмем наш js
            .pipe(sourcemaps.write()) //Пропишем карты
            .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
            .pipe(reload({stream: true})); //И перезагрузим сервер
    });