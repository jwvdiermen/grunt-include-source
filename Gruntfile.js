/*
 * grunt-include-source
 * https://github.com/jwvdiermen/grunt-include-source
 *
 * Copyright (c) 2013 Jan Willem van Diermen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>',
			],
			options: {
				jshintrc: '.jshintrc',
			},
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp'],
		},

		// Variables to be used in templates.
		vars: {
			hello: 'world',
			testFilesPath: 'test/files',
			multipleBasePath: [
				'<%= vars.testFilesPath %>',
				'test/multiple-paths'
			],
			cssPath: 'css',
			lessPath: 'less',
			scssPath: 'scss',
			jsPath: 'js',
			jsArray: [
				'js/_first.js',
				'js/lib/**/*.js',
				'<%= vars.jsPath %>/main.js',
			]
		},

		// Configuration to be run (and then tested).
		// For testing, we simply execute some tasks and validate the output.
		includeSource: {
			options: {
				basePath: '<%= vars.testFilesPath %>',
				baseUrl: ''
			},
			htmlTest: {
				files: {
					'tmp/index.html': '<%= vars.testFilesPath %>/index.html'
				}
			},
			overwriteTest: {
				files: {
					'tmp/overwrite.html': '<%= vars.testFilesPath %>/overwrite.html'
				}
			},
			hamlTest: {
				files: {
					'tmp/index.haml': '<%= vars.testFilesPath %>/index.haml'
				}
			},
			jadeTest: {
				files: {
					'tmp/index.jade': '<%= vars.testFilesPath %>/index.jade'
				}
			},
			lessTest: {
				files: {
					'tmp/main.less': '<%= vars.testFilesPath %>/main.less'
				}
			},
			scssTest: {
				files: {
					'tmp/main.scss': '<%= vars.testFilesPath %>/main.scss'
				}
			},
			cshtmlTest: {
				files: {
					'tmp/index.cshtml': '<%= vars.testFilesPath %>/index.cshtml'
				}
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js'],
		},
		
		lineending: {
			options: {
				eol: 'lf',
				overwrite: true
			},
			files: ['test/expected/*.*', 'test/files/*.*']
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-lineending');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'includeSource', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);

};
