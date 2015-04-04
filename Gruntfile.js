module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      node: {
        files: ['app/**/*'],
        tasks: ['nodewebkit'],
        options: {
          spawn: false,
        }
      }
    },
    nodewebkit: {
      options: {
        platforms: ['win', 'osx', 'linux32', 'linux64'], // Платформы, под которые будет строиться наше приложение
        buildDir: './build', // Путь, по которому будет располагаться построенное приложение
      },
      src: './app/**/*' // Путь, по которому располагаются исходные коды приложения
    },

	copy: {
	    main: {
	      files: [
		  	{
	            src: 'libraries/mac/ffmpegsumo.so',
	            dest: 'build/node-webkit-nodepad/osx32/node-webkit-nodepad.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
	            flatten: true
          	},
	      ]
	    }
	  }    
    
    
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-webkit-builder'); 
  grunt.registerTask('default', ['nodewebkit', 'copy', 'watch']);
};
