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
		extLibs: [
			//'./src/js/ext.js'
		],
		extDist: './public/js/external'
	},
	html: {
		src: [
			'./src/views/**/index.ejs',
		],
		dist: './public',
	},
};

const ejsProps = require('./ejsVaribles.json');

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
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat(jsPath.file))
		.pipe(gulp.dest(jsPath.dist));
	cb();
}

function jsExtLibs(cb) {
	const fs = require('fs');
	const pathModule = require('path');
	const jsPath = path.js;
	let files;
	if (jsPath.extLibs.length > 0) {
		const dirPath = pathModule.join(jsPath.extDist);
		if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
		gulp.src(jsPath.extLibs).pipe(gulp.dest(jsPath.extDist));
		files = fs.readdirSync(pathModule.join(jsPath.extDist)).map(file => {
			return 'js/external/' + file;
		});
	} else files = null;
	Object.assign(ejsProps, {
		extLibs: files,
	});
	cb();
}

function ejsHtml(cb) {
	const pathHtml = path.html;
	console.log(ejsProps);
	gulp.src(pathHtml.src)
		.pipe(ejs(
			ejsProps
		))
		.pipe(rename({
			extname: '.html'
		}))
		.pipe(htmlmin())
		.pipe(beautify.html({
			indent_size: 2
		}))
		.pipe(gulp.dest(pathHtml.dist));
	cb();
}

function bs(cb) {
	browserSync.init({
		server: {
			baseDir: 'public',
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


const startup = gulp.series(jsExtLibs, js, scss, ejsHtml);
const realtime = gulp.parallel(watch, bs);
exports.default = gulp.series(startup, realtime);