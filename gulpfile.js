const { src, dest, series, parallel, watch: w } = require('gulp');
const del = require('del');
const path = require('path');
const stripJsonComments = require('gulp-strip-json-comments');
const ts = require("gulp-typescript");

// build src -> dist
var tsProject = ts.createProject("tsconfig.json");

function compileTypescript(cb) {
    return tsProject.src()
        .pipe(tsProject()).js
        .pipe(dest("dist"));
}

function stripJson() {
    return src('src/**/*.json')
        .pipe(stripJsonComments())
        .pipe(dest('dist/'));
}

function copyMisc() {
    return src(['src/**', '!src/**/*.json', '!src/**/*.ts'])
        .pipe(dest('dist/'));
}

const build = parallel(compileTypescript, stripJson, copyMisc);

// install dist => data
let dataPath = process.env.FOUNDRY_VTT_DATA_PATH;
if (!dataPath || dataPath === "") {
    dataPath = path.join(process.env.LOCALAPPDATA, 'FoundryVTT');
}
const deployPath = path.join(dataPath, 'Data', 'systems', 'fmmua') + '/';

function clean() {
    return del([deployPath], {force: true});
}

function deploy() {
    return src(['dist/**'])
        .pipe(dest(deployPath));
}

exports.default = build;
exports.install = series(build, clean, deploy);
exports.watch = function() {
    w('src/**', build);
}
exports['watch-install'] = series(clean, function watch() {
    w('src/**', series(build, deploy));
});