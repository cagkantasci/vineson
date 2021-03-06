const { src, dest, watch, series, parallel, lastRun } = require("gulp");

const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify");

//====== What's the folder to watch and reload ?

// Where is your source files ?
const srcFolder = "src/";

// Where is your destination files ?
const distFolder = "dist/";

//======

//Compile, prefix and minifify scss
function scssTask() {
  return src(
    srcFolder+"scss/app/*.scss",
    { since: lastRun(scssTask) },
    { sourcemaps: true }
  )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write("."))
    .pipe(dest(distFolder+"css/"))
    .pipe(browserSync.stream());
}


//Compile, prefix and minifify scss for production
function scssTaskProd() {
  return src(
    srcFolder+"scss/app/*.scss",
    { since: lastRun(scssTask) },
    { sourcemaps: true }
  )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano]))
    .pipe(sourcemaps.write("."))
    .pipe(dest(distFolder+"css/"))
    .pipe(browserSync.stream());
}

// compile uglify and replace js
function jsTask() {
  return src(srcFolder+"js/app/*.js", { since: lastRun(jsTask) })
    .pipe(uglify())
    .pipe(dest(distFolder+"dist/js/"))
    .pipe(browserSync.stream());
}


// replace html
function htmlTask() {
  return src(srcFolder+"*.html").pipe(dest(distFolder));

}

function watchTask() {
  browserSync.init({
    server: {
      baseDir: distFolder
    }
  });
  watch(
    [srcFolder+`scss/app/*.scss` , srcFolder+"*.html", srcFolder+"js/app/*.js"],
    series(htmlTask, scssTask, jsTask)
  ).on("change", browserSync.reload);
}

function watchTaskProduction() {
  browserSync.init({
    server: {
      baseDir: distFolder
    }
  });
  watch(
    ["*.scss", "*.html", "*.js"],
    series(parallel(scssTaskProd, jsTask), htmlTask)
  ).on("change", browserSync.reload);
}

exports.default = watchTask;
exports.production = watchTaskProduction;
