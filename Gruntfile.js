module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        separator: ";"
      },
      dist: {
        src: ["public/js/*.js"],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
//      dist: {
//        files: {
//          'dist/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
//        }
//      }
      dist: {
        files: [{
          expand: true,
          cwd: 'public/js',
          src: '**/*.js',
          dest: 'dist/js'
        }]
      }
    },
    jshint: {
      files: ["Gruntfile.js", "public/*.js"],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["jshint"]
    },
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeEmptyAttributes: true,
          removeOptionalTags: false,
          removeRedundantAttributes: true,
          removeAttributeQuotes: false,
          removeCommentsFromCDATA: true,
          keepClosingSlash: true,
          useShortDoctype: true,
          minifyJS: true,
          minifyCSS: true
        },
        files: [{
          expand: true,
          cwd: 'views',
          src: "**/*.html",
          dest: 'dist/html'
        }]
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/css',
          src: '**/*.css',
          dest: 'dist/css',
          ext: '.css'
        }]
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public/images',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/images'
        }]
      }
    }
  });


  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-htmlmin");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-imagemin");



//  grunt.registerTask("default", ["jshint", "htmlmin", "cssmin", "imagemin", "concat", "uglify"]);
  grunt.registerTask("default", ["jshint", "htmlmin", "cssmin", "imagemin", "uglify"]);

};