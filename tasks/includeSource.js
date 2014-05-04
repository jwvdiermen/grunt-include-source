/*
 * grunt-include-source
 * https://github.com/jwvdiermen/grunt-include-source
 *
 * Copyright (c) 2013 Jan Willem van Diermen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
	var path = require('path');
	var url = require('url');
	var os = require('os');
	var util = require('util');
	var extendr = require('extendr');

	var parseSource = function (name, pattern) {
		return function(source) {
			var matches,
				results = [];

			grunt.log.debug('Parsing ' + name + '...');
			while ((matches = pattern.exec(source)) !== null) {
				if (matches.length <= 1) continue;
				grunt.log.debug('Got match, options are { ' + matches[1] + ' }.');
				var optionsObj = JSON.parse("{" + matches[1] + "}");
				results.push({
					start: matches.index,
					end: matches.index + matches[0].length - 1,
					options: optionsObj
				});
			}

			return results;
		};
	};

	var parsers = {
		'html': parseSource('HTML', /<!---?\s*include:\s+(.*)\s*-?--\s*>/gi),
		'haml': parseSource('HAML', /-#\s+include:\s+(.*)/gi),
		'jade': parseSource('JADE', /\/\/-?\s+include:\s+(.*)/gi),
		'scss': parseSource('SASS', /\/\/\s+include:\s+(.*)/gi),
		'less': parseSource('LESS', /\/\/\s+include:\s+(.*)/gi)
	};

	var templates = {
		'html':
		{
			'js': '<script type="text/javascript" src="{filePath}"></script>',
			'css': '<link href="{filePath}" rel="stylesheet" type="text/css">'
		},
		'haml':
		{
			'js': '%script{src: "{filePath}", type: "text/javascript"}',    
			'css': '%link{href: "{filePath}", rel: "stylesheet", type: "text/css"}/'
		},
		'jade':
		{
			'js': 'script(src="{filePath}", type="text/javascript")',    
			'css': 'link(href="{filePath}", rel="stylesheet", type="text/css")'
		},
		'scss':
		{
			'scss': '@import "{filePath}";',
			'css': '@import "{filePath}";'
		},
		'less':
		{
			'less': '@import "{filePath}";',
			'css': '@import "{filePath}";'
		}
	};

	var resolveFiles = function (basePath, includeOptions) {
		if (includeOptions.basePath) {
			basePath = includeOptions.basePath;
		}
		grunt.log.debug('Resolving files on base path "' + basePath + '"...');
		grunt.log.debug('Include options: ' + util.inspect(includeOptions));

		var files, sourcePath = '';
		if (includeOptions.bower) {
			grunt.log.debug('Resolving files from Bower component "' + includeOptions.bower + '"...');

			sourcePath =  path.join('bower_components', includeOptions.bower);
			basePath = path.join(basePath, sourcePath);
			grunt.log.debug('Full path is "' + basePath + '".');

			var sources = grunt.file.readJSON(path.join(basePath, 'bower.json')).sources;
			files = sources[includeOptions.type];
		} else {
			grunt.log.debug('Resolving files from include property...');
			files = includeOptions.files;
		}

		if (!files) {
			grunt.log.debug('No files found.');
			return [];
		}

		grunt.log.debug('Expanding files: ' + util.inspect(files));
		var expandedFiles = grunt.file.expand({ cwd: basePath }, files);

		var results = [];
		for (var i = 0; i < expandedFiles.length; ++i) {
			var file = path.join(sourcePath, expandedFiles[i]).replace(/\\/g, '/');
			grunt.log.debug('Found file "' + file + '".');
			results.push(file);
		}

		return results;
	};

	var pathCompareNatural = function (path1, path2) {
		if (path1 > path2) {
			return 1;
		} else if (path1 < path2) {
			return -1;
		} else { 
			return 0;
		}
	};

	var pathCompareTopDown = function (path1, path2) {
		var seg1 = path1.split(/[\\/]/);
		var seg2 = path2.split(/[\\/]/);
		var i, j;
				
		if (seg1.length === seg2.length) {
			return pathCompareNatural(path1, path2);
		} else {
			j = Math.min(seg1.length, seg2.length) - 1;
			for (i = 0; i < j; ++i) {
				if (seg1[i] !== seg2[i]) {
					return pathCompareNatural(path1, path2);
				}
			}
			return seg1.length - seg2.length;
		}				
	};		
	
	var orderFiles = function (files, includeOptions) {
		if ('top-down' === includeOptions.ordering) {
			files.sort(pathCompareTopDown);		
		}
	};
	
	// Register the task.
	grunt.registerMultiTask('includeSource', 'Include lists of files into your source files automatically.', function() {
		grunt.log.debug('Starting task "includeSource"...');

		var options = this.options({
			basePath: '',
			baseUrl: '',
			templates: {}
		});

		grunt.log.debug('Base path is "' + options.basePath + '".');

		// Iterate over all specified file groups.
		this.files.forEach(function(file) {
			grunt.log.debug('Handling output file "' + file.dest + "'...");

			// Concatenate the source files.
			var contents = file.src.filter(function(filePath) {
					grunt.log.debug('Using input file "' + filePath + '".');
					// Remove nonexistent files.
					if (!grunt.file.exists(filePath)) {
						grunt.log.warn('Source file "' + filePath + '" not found.');
						return false;
					} else {
						return true;
					}
				}).map(	function(filePath) {
					// Read and return the file's source.
					return grunt.file.read(filePath);
				}).join('\n');

			// Parse the contents, using a parser based on the target file.
			var fileType = path.extname(file.dest).substr(1);
			grunt.log.debug('File type is "' + fileType + '"');

			var parserFn = parsers[fileType];

			if (!parserFn) {
				grunt.log.error('No parser found found file type "' + fileType + '".');
				return false;
			}

			// Get the available templates.
			var localTemplates = extendr.deepClone(templates);
			extendr.safeDeepExtendPlainObjects(localTemplates, options.templates);
			var typeTemplates = localTemplates[fileType];

			// Get the includes and rewrite the contents.
			var includes = parserFn(contents);
			var currentOffset = 0;

			grunt.log.debug('Found ' + includes.length + ' include statement(s).');

			includes.forEach(function(include) {
				var files = resolveFiles(options.basePath, include.options);
				orderFiles(files, include.options);
	
				var sep = os.EOL,
					lookFor = [ ' ', '\t', '\r', '\n' ],
					i;

				for (i = include.start + currentOffset - 1; i > 0 && lookFor.indexOf(contents[i]) >= 0; --i);
				if (i > 0) {
					++i;
					sep = contents.substr(i, include.start + currentOffset - i);
				}
				
				var	includeFragments = [];
				files.forEach(function(file) {
					grunt.log.debug('Including file "' + file + '".');
					includeFragments.push(typeTemplates[include.options.type]
						.replace(/\{filePath\}/g, url.resolve(include.options.baseUrl || options.baseUrl, file))
						.replace(/\{filePathDecoded\}/g, decodeURI(url.resolve(include.options.baseUrl || options.baseUrl, file)))
					);
				});

				var includeFragment = includeFragments.join(sep);

				contents =
					contents.substr(0, include.start + currentOffset) +
					includeFragment +
					contents.substr(include.end + 1 + currentOffset);

				var originalLength = include.end - include.start + 1;
				currentOffset += includeFragment.length - originalLength;
			});

			grunt.log.debug('Writing output...');
			grunt.file.write(file.dest, contents);
			grunt.log.writeln('File "' + file.dest + '" created.');
		});
	});
};
