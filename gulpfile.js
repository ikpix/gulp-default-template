const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const beautify = require('gulp-beautify');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

const path = {
	css: {
		src: './src/scss/**/*.scss',
		dist: './public/css',
		file: '/styles.css',
	}, 
	js: {
		src: [
			'./src/js/script.js',
		],
		dist: './public/js',
		file: '/scripts.js',
		extLibs: []
	},
	html: {
		src: [
			'./src/views/**/index.ejs',
		],
		dist: './public',
	},
};

const bsConf = {
	baseDir: 'public',
};

function scss(cb) {
	const cssPath = path.css;
	gulp.src(cssPath.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(cssPath.dist))
		.pipe(browserSync.stream());
	cb();
}

function js(cb) {
	const jsPath = path.js;
	gulp.src(jsPath.src)
		.pipe(babel({presets: ['@babel/env']}))
		.pipe(concat(jsPath.file))
		.pipe(gulp.dest(jsPath.dist));
	cb();
}

function jsExtLibs(cb) {
	const jsPath = path.js;
	if (jsPath.extLibs.length > 0) {
		gulp.src(jsPath.extLibs)
		.pipe(gulp.dest(jsPath.dist));
	}
	cb();
}

function ejsHtml(cb) {
	const pathHtml = path.html;
	const vars = require('./ejsVaribles.json');
	Object.assign(vars, {});
	gulp.src(pathHtml.src)
		.pipe(ejs(
			vars
		))
		.pipe(rename({extname: '.html'}))
		.pipe(htmlmin())
		.pipe(beautify.html({ indent_size: 2 }))
		.pipe(gulp.dest(pathHtml.dist));
	cb();
}

function bs(cb) {
	browserSync.init({
		server: {
			baseDir: bsConf.baseDir,
		},
		notify: false
	});
	cb();
}

function watch(cb) {
	gulp.watch(path.css.src, scss);
	gulp.watch(path.js.src, js).on('change', browserSync.reload);
	gulp.watch('./src/views/**/*.ejs', ejsHtml).on('change', browserSync.reload);
	cb();
}


const startup = gulp.series(jsExtLibs, ejsHtml, js, scss);
const realtime = gulp.parallel(watch, bs);
exports.default = gulp.series(startup, realtime);



