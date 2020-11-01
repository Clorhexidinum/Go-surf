"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;

gulp.task("css", function () {
  return gulp.src([
    "source/sass/style.scss",
    "node_modules/animate.css/animate.css",
])
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("normalize", function () {
  return gulp.src("source/css/normalize.css")
    .pipe(rename("normalize.min.css"))
    .pipe(gulp.dest("build/css"))
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false,
    index: "index.html"
  });
  gulp.watch("source/scss/*/*.scss", gulp.series("css"));
  // gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/*.html").on('change', browserSync.reload);
  gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("images", function () {
  return gulp.src("source/images/*/.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/images"));
});

gulp.task("webp", function () {
  return gulp.src([
    "source/images/*/.{png,jpg}",
    "!source/images/ignored_by_webp/",
    "!source/images/ignored_by_webp/*.{png,jpg}"
  ])
    .pipe(webp({quality: 75}))
    .pipe(gulp.dest("buld/img"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest("build/js"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/css/style.css",
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("gulp", gulp.series("css", "server"));
gulp.task("build", gulp.series("clean", "copy", "images", "webp", "normalize", "css", "html", "js"));
gulp.task("start", gulp.series("build", "server"));