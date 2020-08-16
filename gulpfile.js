const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const beautify = require('gulp-beautify');
const htmlmin = require('gulp-htmlmin');

const path = {
	css: {
		src: './src/scss/**/*.scss',
		dist: './public/css',
		file: '/styles.css',
	}, 
	js: {
		src: [
			'./src/js/test.js'
		],
		dist: './public/js',
		file: '/scripts.js',
	},
	html: {
		src: [
			'./src/views/**/index.ejs',
		],
		dist: './public',
	}
};

function scss(cb) {
	const cssPath = path.css;
	gulp.src(cssPath.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(cssPath.dist));
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

function ejsHtml(cb) {
	const pathHtml = path.html;
	gulp.src(pathHtml.src)
		.pipe(ejs())
		.pipe(rename({extname: '.html'}))
		.pipe(htmlmin())
		.pipe(beautify.html({ indent_size: 2 }))
		.pipe(gulp.dest(pathHtml.dist));
	cb();
}

function watch(cb) {
	gulp.watch(path.js.src, js);
	gulp.watch(path.css.src, scss);
	gulp.watch(path.html.src, ejsHtml);
	cb();
}



const parallel = gulp.parallel(watch);
exports.default = gulp.series(ejsHtml, js, scss, parallel);