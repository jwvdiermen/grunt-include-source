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

		// Configuration to be run (and then tested).
		// For testing, we simply execute some tasks and validate the output.
		includeSource: {
			options: {
				basePath: 'test/files',
				baseUrl: ''
			},
			htmlTest: {
				files: {
					'tmp/index.html': 'test/files/index.html'
				}
			},
			hamlTest: {
				files: {
					'tmp/index.haml': 'test/files/index.haml'
				}
			},
			jadeTest: {
				files: {
					'tmp/index.jade': 'test/files/index.jade'
				}
			},
			lessTest: {
				files: {
					'tmp/main.less': 'test/files/main.less'
				}
			},
			scssTest: {
				files: {
					'tmp/main.scss': 'test/files/main.scss'
				}
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js'],
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'includeSource', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'test']);

};
