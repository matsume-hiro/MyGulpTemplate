var gulp = require("gulp");
var del = require("del");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");

//sass導入
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssdeclsort = require("css-declaration-sorter");
var mqpacker = require("css-mqpacker");
var sourcemaps = require("gulp-sourcemaps");

var browserSync = require("browser-sync").create();

//sassタスク
gulp.task("sass", function () {
  return gulp
    .src(["./src/scss/**/*.scss", "!./src/scss/**/_*.scss"])
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass({ outputstyle: "expanded" }))
    .pipe(postcss([autoprefixer({ grid: true })]))
    .pipe(postcss([mqpacker()]))
    .pipe(postcss([cssdeclsort({ order: "smacss" })]))
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("./src/css"))
    .pipe(browserSync.stream());
});

gulp.task(
  "watch",
  gulp.series("sass", function () {
    browserSync.init({
      server: {
        baseDir: "./src",
        index: "index.html",
      },
    });

    gulp.watch("./src/scss/**/*.scss", gulp.task("sass"));
    gulp.watch("./src/css/**/*.css").on("change", browserSync.reload);
    gulp.watch("./src/**/*.html").on("change", browserSync.reload);
  })
);

gulp.task("clean", del.bind(null, ["dist"]));

gulp.task(
  "build",
  gulp.series(gulp.parallel("sass", "clean"), function () {
    return gulp
      .src(
        [
          "./src/**/*.html",
          "./src/css/**",
          "./src/assets/**",
          "./src/js/**",
          "!node_modules/**/*.html",
        ],
        {
          base: "./src",
        }
      )
      .pipe(gulp.dest("dist"));
  })
);

gulp.task('build-without-image', gulp.series(gulp.parallel('sass', 'slim', 'clean'), function () {
  return gulp.src([
    "./src/**/*.html",
    "./src/css/**",
    "./src/js/**",
    "!node_modules/**/*.html",
  ], {
    base: './src'
  })
    .pipe(gulp.dest('dist'));
}));

gulp.task('build-only-diff', gulp.series(gulp.parallel('sass', 'clean'), function (done) {
  var diffFiles = argv.diff !== true ? argv.diff.split(',') : [];
  var srcRet = diffFiles.filter(fl => fl.match(/\.html$|^js\/|^img\/|^video\/|^media\//g));
  if (diffFiles.some(fl => fl.match(/^scss\//g))) srcRet.push('./src/css/**');
  if (srcRet.length == 0) return done();
  return gulp.src(srcRet, {
    base: './src'
  })
    .pipe(gulp.dest('dist'));
}));
