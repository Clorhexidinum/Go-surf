const gulp = require('gulp');
const concat = require('gulp-concat');
const del = require('del');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const jpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemap = require('gulp-sourcemaps');
const rollup = require('gulp-rollup');
const rename = require("gulp-rename");
const cache = require('gulp-cache');
const fs = require('fs');
const realFavicon = require('gulp-real-favicon');
const FAVICON_DATA_FILE = 'faviconData.json';
const browserSync = require('browser-sync').create();
const config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 3333
};
const ghPages = require('gulp-gh-pages');

gulp.task('clearBuild', function() {
  return del(['build/*'])
});

gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('build/'));
});

gulp.task('css', function() {
  return gulp.src(['src/css/normalize.css', 'node_modules/slick-carousel/slick/slick.scss', 'src/scss/style.scss'])
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(concat('style.css'))
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('../maps'))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  return gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/slick-carousel/slick/slick.js', 'src/js/**/*.js'])
    .pipe(sourcemap.init())
    .pipe(rollup({
      input: './src/js/main.js',
      output: {
        format: 'esm'
      }
    }))
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(uglify())
	.pipe(concat('main.js'))
    .pipe(rename('main.min.js'))
    .pipe(sourcemap.write('../maps'))
    .pipe(gulp.dest('build/js/'))
    .pipe(browserSync.stream());
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*.*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      jpegRecompress({
        loops: 5,
        min: 70,
        max: 80,
        quality:'high'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: [.65, .7], speed: 5})
      ],{ verbose: true }
    )))
    .pipe(gulp.dest('build/images/'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*.*')
    .pipe(gulp.dest('build/fonts/'));
});

gulp.task('generate-favicon', function(done) {
  realFavicon.generateFavicon({
    masterPicture: 'src/images/logo.png',
    dest: 'build/favicon',
    iconsPath: 'favicon',
    design: {
      ios: {
        pictureAspect: 'noChange',
        backgroundColor: '#ffffff',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#ffffff',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: '#ffffff',
        manifest: {
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#ffffff'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

gulp.task('inject-favicon-markups', function() {
  return gulp.src('src/*.html')
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(gulp.dest('build'));
});

gulp.task('set-favicon', gulp.series('generate-favicon', 'inject-favicon-markups'));

gulp.task('watch', function() {
  browserSync.init(config);
  gulp.watch('src/scss/**/*.scss', gulp.series('css'));
  gulp.watch('src/js/**/*.js', gulp.series('scripts'));
  gulp.watch('src/*.html', gulp.series('html')).on('change', browserSync.reload);
});

gulp.task('build',
  gulp.series('clearBuild',
    gulp.parallel('html', 'css', 'scripts', 'images', 'fonts')
  )
);

gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

gulp.task('default', gulp.series('build', 'watch'));
