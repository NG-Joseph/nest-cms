const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
//const { basename } = require('path');

const paths = {
    styles: {
      src: 'src/bulma/css/**/*.css', //indicate the source files to minify
      dest: 'public/css/' //indicate the output destination
    }
  };

const minifyCSS = () => {
  return gulp.src(paths.styles.src)
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(rename(/*{
          //basename: 'new-base-name-if-desired', //use a new destination base name if different from the source filename.
          suffix: '.min.css' //add the suffix to show that it is minimized
        }*/
        function (path){
          return{
            dirname: path.dirname,
            basename: path.basename,
            extname: ".min.css"
          }
        }
        ))
      .pipe(gulp.dest(paths.styles.dest));
};

exports.default = minifyCSS
