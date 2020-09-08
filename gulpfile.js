const { src, dest, series, parallel, watch: w } = require('gulp');
const del = require('del');
const path = require('path');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const stripJsonComments = require('gulp-strip-json-comments');
const ts = require("gulp-typescript");
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

// build src -> dist
var tsProject = ts.createProject("tsconfig.json");

function cleanBuild() {
    return del(["dist"]);
}

function compileTypescript() {
    return tsProject.src()
        .pipe(tsProject()).js
        .pipe(dest("dist"));
}

function compileSass() {
    return src("src/**/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(concat("main.css"))
        .pipe(dest("./dist"));
}

function stripJson() {
    return src('src/**/*.json')
        .pipe(stripJsonComments())
        .pipe(dest('dist/'));
}

function copyMisc() {
    return src(['src/**', '!src/**/*.json', '!src/**/*.scss', '!src/**/*.ts'])
        .pipe(dest('dist/'));
}

const build = parallel(compileTypescript, compileSass, stripJson, copyMisc);

exports.clean = cleanBuild;
exports.default = build;

// install dist -> data
let dataPath = process.env.FOUNDRY_VTT_DATA_PATH;
if (!dataPath || dataPath === "") {
    dataPath = path.join(process.env.LOCALAPPDATA, 'FoundryVTT');
}
const deployPath = path.join(dataPath, 'Data', 'systems', 'fmmua') + '/';

function cleanDeploy() {
    return del([deployPath], {force: true});
}

function deploy() {
    return src(['dist/**'])
        .pipe(dest(deployPath));
}

exports.install = series(build, cleanDeploy, deploy);
exports.watch = function() {
    w('src/**', build);
}
exports['watch-install'] = series(cleanDeploy, deploy, function watch() {
    w('src/**', series(build, deploy));
});

// publish dist -> zip
function publish() {
    return src('dist/**')
		.pipe(zip('fmmua.zip'))
		.pipe(dest('rel/'));
}

exports.release = series(cleanBuild, build, publish);