module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      options:{
        reporter: 'nyan'
      },
      src: ['test/*.js']
    },
    uglify: {
      options:{
        //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
      },
      release:{
        files:{
          'build/config.min.js': ['lib/config.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default',['mochaTest', 'uglify']);
};
