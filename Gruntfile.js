/* global module, require */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      options: {
	force: true
      },
      index: {
	src: ['tmp/**/*']
      }
    },

    /********************* STYLE *********************/
    stylus: {
      options: {
	compress: true,
	'include css': true
      },
      compile: {
	files: {
	  'tmp/app.css': 'src/css/*.styl'
	}
      }
    },
    cssmin: {
      compress: {
	files: {
	  'tmp/app.css': 'tmp/app.css'
	}
      }
    },
    staticinline: {
      main: {
	files: {
	  'tmp/index.html': 'tmp/index.html'
	}
      }
    },

    /********************* JAVASCRIPT *********************/
    concat: {
      vendor: {
	files: {
	  'tmp/vendor.js': [
	    'bower_components/doT/doT.min.js',
	    'src/element.js',
	    'src/request.js'
	  ]
	}
      },
      production: {
	files: {
	  'tmp/app.js' : [
	    'config/production.js',
	    'tmp/app.js'
	  ]
	}
      },
      development: {
	files: {
	  'tmp/app.js' : [
	    'config/development.js',
	    'tmp/app.js'
	  ]
	}
      },
      js: {
	files: {
	  'tmp/app.js' : [ 'src/js/**/*.js' ]
	}
      },
      index: {
	files: {
	  'tmp/app.js' : [
	    'tmp/app.js',
	    'src/index.js'
	  ]
	}
      }
    },
    uglify: {
      options: {
	beautify: {
	  ascii_only: true,
	  inline_script: true
	}
      },
      vendor: {
	files: {
	  'tmp/vendor.js': ['tmp/vendor.js']
	}
      },
      js: {
	files: {
	  'tmp/app.js': ['tmp/app.js']
	}
      }
    },
    
    inline: {
      index: {
	src: [ 'tmp/index.html' ]
      }
    },
    jade: {
      index: {
	files: [{
	  'tmp/index.html': ['src/html/index.jade']
	}]
      },
      partials: {
	files: [{
	  expand: true,
	  src: ['**/*.jade'],
	  dest: 'tmp/',
	  cwd: 'src/html/partials/',
	  ext: '.html'
	}]
      }
    },
    inline_angular_templates: {
      index: {
	options: {
	  base: 'tmp',
	  prefix: '/',
	  selector: 'body',
	  method: 'prepend'
	},
	files: {
	  'tmp/index.html': ['tmp/**/*.html', '!tmp/index.html']
	}
      }
    },	
    htmlmin: {
      index: {
	options: {
	  collapseWhitespace: true,
	  removeComments: true
	},
	files: {
	  'tmp/index.html': 'tmp/index.html'
	}
      }
    },
    copy: {
      index: {
	files: [{
	  expand: true,
	  flatten: true,
	  src: 'tmp/index.html',
	  dest: './'
	}]
      }
    },

    watch: {
      index: {
	files: [
	  'Gruntfile.js',
	  'config/**/*.js',
	  'src/html/**/*.jade',
	  'src/**/*.js',
	  'bower_components/**/*',
	  'src/css/**/*'
	],
	tasks: ['development']
      }
    },

    jshint: {
      options: {
	curly: false,
	undef: true,
	unused: true,
	bitwise: true,
	freeze: true,
	smarttabs: true,
	immed: true,
	latedef: true,
	newcap: true,
	noempty: true,
	nonew: true,
	laxbreak: true,
	trailing: true,
	forin: true,
	eqeqeq: true,
	eqnull: true,
	force: true,
	quotmark: 'single',
	expr: true
      },
      main: [
	'src/**/*.js'
      ]
    }
  });

  grunt.registerTask('base', [
    'clean',
    'stylus',
    'cssmin',
    'concat:vendor',
    'concat:js'
  ]);

  grunt.registerTask('after', [
    'concat:index',
    'jade:partials',
    'inline_angular_templates',
    'staticinline',
    'inline',
    'htmlmin',
    'copy'
  ]);

  grunt.registerTask('default', [
    'base',

    'concat:development',
    'jade:index',

    'after'
  ]);

  grunt.registerTask('production', [
    'base',

    'concat:production',
    'jade:index',

    'uglify',
    'after'
  ]);

  grunt.registerTask('development', [
    'base',

    'concat:development',
    'jade:index',

    'after'
  ]);

  grunt.loadNpmTasks('grunt-contrib-clean');    
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-static-inline');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-inline-angular-templates');

};	
