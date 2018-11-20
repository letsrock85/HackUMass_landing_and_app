const gulp = require('gulp');
const babel = require('gulp-babel'); // In case if i use babelify
const babelify = require("babelify");
const nodemon = require("gulp-nodemon");
const browserSync = require('browser-sync').create();

/* Default */
const fs = require('fs');

/* Mixed */
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

/* JS */
const uglify = require('gulp-uglify');

// ENVIRONMENT //
let env, i = process.argv.indexOf("--env");
if(i>-1) {
    env = process.argv[i+1];
}
console.log(env);
gulp.task('build-js', () => {
   return browserify({
            entries: [
              './src/js/core.min.js',
              './src/js/script.js',
              './src/js/thesaas.min.js'
              ]}) // entry point
    // .transform(babelify, {
    // // sourceType: "module",
    // })
    .bundle()  
    .pipe(source('bundle.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('copy-files-into-build', () => {
    gulp.src('./index.html')
    .pipe(gulp.dest('./build'));
});
gulp.task('browser-sync', ['devmode'], () => {
    browserSync.init({
      proxy: "localhost:3000",  // local node app address
      port: 3002
        
    });
});
gulp.task('devmode', () => {
    return nodemon({
               script: 'server-app.js', // run ES6 code
               ext: 'js',
               ignore: ['src/**/*.js'],
               //watch: ['*.js'], // watch ES2015 code
               //tasks: [ 'build-js', 'watchClient'] // compile synchronously onChange
               env: {
                'NODE_ENV': 'development',
                'DEBUG': 'appname:*'
                }
              })

    .on('start', browserSync.reload)
    .on('change', browserSync.reload)
    .once('quit', function () {
      // handle ctrl+c without a big weep
      process.exit();
   });
});

gulp.task('watchClient', () => {
  
  // gulp.start('build-js');
  gulp.watch("src/**/*.js", ['build-js', 'reload']);
  gulp.watch("views/**/*.handlebars", ['reload']);
  gulp.watch(['./routes/**/*.js', './server-app.js'], ['bs-delay']);
    
});
gulp.task('reload', () => {

  browserSync.reload();
    
});
gulp.task('bs-delay', () => {

  setTimeout(function () {
    browserSync.reload({ stream: false });
  }, 1000);
    
});
gulp.task('all', () => {

  gulp.start('browser-sync');
  gulp.start('watchClient');
  gulp.start('watchExpress');

});
gulp.task('default', ['browser-sync'], () => {

  gulp.start('watchClient');
  //gulp.start('browser-sync');
  //env == 1 ?  gulp.start('watchClient') : gulp.start('all');

});