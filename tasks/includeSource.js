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

	// Generates function to find end marker, e.g. <!-- /include -->
	var findEndMarker = function(name, pattern){
		/*
			source: Code between the current include and the next one. (Or the end of the file)
			offset: Stat position of the source fragement inside the file.
		*/
		return function(source, offset){
			var endMarker = pattern.exec(source);
			if (endMarker === null){
				return null;
			}
			return {
				start: endMarker.index + offset,
				length: endMarker[0].length
			};
		};
	};

	var parsers = {
		'html': parseSource('HTML', /<!---?\s*include:([\s\S]*?)-?--\s*>/gi),
		'haml': parseSource('HAML', /-#\s+include:\s+(.*)/gi),
		'jade': parseSource('JADE', /\/\/-?\s+include:\s+(.*)/gi),
		'scss': parseSource('SASS', /\/\/\s+include:\s+(.*)/gi),
		'ts': parseSource('TS', /\/\/\/\s<!---?\s*include:\s+(.*)\s*-?--\s*>/gi)
	};

	var endMarkerParsers = {
		'html': findEndMarker('HTML', /<!---?\s*\/include\s+-?--\>/i),
		'haml': findEndMarker('HAML', /-#\s+\/include/i),
		'jade': findEndMarker('JADE', /\/\/-?\s+\/include/i),
		'scss': findEndMarker('SASS', /\/\/\s+\/include/i),
		'ts': findEndMarker('TS', /\/\/\/\s<!---?\s*\/include\s+-?--\>/i)
	};

	var templates = {
		'html':
		{
			'js': '<script src="{filePath}"></script>',
			'css': '<link href="{filePath}" rel="stylesheet" type="text/css">'
		},
		'haml':
		{
			'js': '%script{src: "{filePath}"}',
			'css': '%link{href: "{filePath}", rel: "stylesheet", type: "text/css"}/'
		},
		'jade':
		{
			'js': 'script(src="{filePath}")',
			'css': 'link(href="{filePath}", rel="stylesheet", type="text/css")'
		},
		'scss':
		{
			'scss': '@import "{filePath}";',
			'css': '@import "{filePath}";'
		},
		'ts':
		{
			'ts': '/// <reference path="{filePath}" />'
		}
	};

	var defaultTypeMappings = {
		'cshtml': 'html',
		'less': 'scss'
	};

	var resolveFiles = function (options, includeOptions) {
		var basePath = includeOptions.basePath || options.basePath;
		grunt.log.debug('Resolving files on base path "' + basePath + '"...');
		grunt.log.debug('Include options: ' + util.inspect(includeOptions));

		basePath = grunt.config.process(basePath);

		var files, sourcePath = '';
		if (includeOptions.bower) {
			grunt.log.debug('Resolving files from Bower component "' + includeOptions.bower + '"...');

			sourcePath = path.join('bower_components', includeOptions.bower);
			basePath = path.join(basePath, sourcePath);
			grunt.log.debug('Full path is "' + basePath + '".');

			var sources = grunt.file.readJSON(path.join(basePath, 'bower.json')).sources;
			files = sources[includeOptions.type];
		} else {
			grunt.log.debug('Resolving files from include property...');

			// Retrieve files property. If it's a string, process it as a template.
			files = includeOptions.files;
			files = grunt.config.process(files);
		}

		if (!files) {
			grunt.log.debug('No files found.');
			return [];
		}

		grunt.log.debug('Expanding files: ' + util.inspect(files));

		// Split patterns. Apperently, grunt.file.expandMapping doesn't automatically split
		// comma seperated lists, even if it says so in the documentation.
		// Split here manually so the exclusion patterns work.
		if (typeof files == 'string') {
			files = files.split(',');
		}

		// Expand patterns.
		var expandedFiles, i;
		var expand = function(x, f) {
			return grunt.file.expandMapping(f, sourcePath, { cwd: x, rename: options.rename, flatten: options.flatten });
		};
		if (basePath instanceof Array) {
			expandedFiles = [];
			for (i = 0 ; i < basePath.length; ++i) {
				grunt.log.debug('Expanding files at: ' + basePath[i]);
				expandedFiles = expandedFiles.concat(expand(basePath[i], files));
			}
		} else {
			expandedFiles = expand(basePath, files);
		}

		var results = [];
		for (i = 0; i < expandedFiles.length; ++i) {
			var file = expandedFiles[i].dest.replace(/\\/g, '/');
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
			templates: {},
			typeMappings: {}
		});
		options.target = this.target;

		var typeMappings = extendr.clone(defaultTypeMappings);
		extendr.extend(typeMappings, options.typeMappings);

		grunt.log.debug('Base path is "' + options.basePath + '".');

		// Iterate over all specified file groups.
		this.files.forEach(function(file) {
			grunt.log.debug('Handling output file "' + file.dest + "'...");

			// Concatenate the source files.
			var contents = '';
			var contentSources = file.src.filter(function(filePath) {
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
				});

			// Don't bother detecting newline if we have no more than 1 file.
			if (contentSources.length > 1) {
				// Detect the newline to use for the content files.
				// Use the first file to detect the newlines, no use to test all of them.
				var contentNewline = /\r\n/g.test(contentSources[0]) ? '\r\n' : '\n';

				// Join the content files as one to be processed.
				contents = contentSources.join(contentNewline);
			}
			else {
				// Still use join here, since 'contentSources' could have a length of 0?
				contents = contentSources.join();
			}

			// Parse the contents, using a parser based on the target file.
			var fileType = path.extname(file.dest).substr(1);
			grunt.log.debug('File type is "' + fileType + '"');

			// Try and map the file type, using it instead.
			var mappedFileType = typeMappings[fileType];
			if (mappedFileType) {
				grunt.log.debug('File type "' + fileType + '" maps to "' + mappedFileType + '"');
				fileType = mappedFileType;
			}

			var parserFn = parsers[fileType];
			var findEndMarker = endMarkerParsers[fileType];

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

			includes.forEach(function(include, includeIndex) {
				var files = [];
				var baseUrl;
				if (include.options.target && options.target !== include.options.target) {
					grunt.log.debug('Include target is "' + include.options.target + '" and task target is "' + options.target + '", skipping include.');
				} else {
					files = resolveFiles(options, include.options);
				}
				orderFiles(files, include.options);
				
				if(include.options.baseUrl) {
					baseUrl = grunt.config.process(include.options.baseUrl);
				} else {
					baseUrl = options.baseUrl;
				}
	
				var sep = os.EOL,
					lookFor = [ ' ', '\t', '\r', '\n' ],
					i;

				// Find separators to maintain indentation when including fragment
				for (i = include.start + currentOffset - 1; i > 0 && lookFor.indexOf(contents[i]) >= 0; --i){
					// Don't allow multiple lines as separator, so break when we found one
					if (contents[i] === '\n'){
						i--;
						// Skip an extra character in case the endline is \r\n instead of just \n
						if (contents[i] === '\r'){
							i--;
						}
						break;
					}
				}
				if (i > 0) {
					++i; // Increment by one, since the index we found is the first non-indentation character.
					sep = contents.substr(i, include.start + currentOffset - i);
				}
				else {
					// So we probably are at the beginning of the file.
					// Scan forward so we can atleast detect what line endings are being used.
					// Keep it simple, if \r\n exists, use that, else just \n.
					sep = /\r\n/g.test(contents) ? '\r\n' : '\n';
				}
				
				var	includeFragments = [];
				files.forEach(function(file) {
					grunt.log.debug('Including file "' + file + '".');

					// Map the include type.
					var includeType = include.options.type;
					var mappedIncludeType = typeMappings[includeType];
					if (mappedIncludeType) {
						grunt.log.debug('Include type "' + includeType + '" maps to "' + mappedIncludeType + '"');
						includeType = mappedIncludeType;
					}

					includeFragments.push(typeTemplates[includeType]
						.replace(/\{filePath\}/g, url.resolve(baseUrl, file))
						.replace(/\{filePathDecoded\}/g, decodeURI(url.resolve(baseUrl, file)))
					);
				});

				var includeFragment = includeFragments.join(sep);

				// If there is an end marker before the next include or the end of the file
				// we want to replace the entire content between it and the include comment.
				var endMarker = null;
				if (findEndMarker){
					var nextInclude = includes[includeIndex + 1];
					var nextPartIndex = nextInclude ? (nextInclude.start + currentOffset): contents.length;
					var between = contents.substring(include.start + currentOffset, nextPartIndex);

					endMarker = findEndMarker(between, include.start);
				}

				var replacementStart;
				var replacementEnd;
				if (endMarker === null) {
					replacementStart = include.start + currentOffset;
					replacementEnd = include.end + 1 + currentOffset;
				} else {
					replacementStart = include.end + 1 + currentOffset + sep.length;
					replacementEnd = endMarker.start + currentOffset;
					includeFragment += sep;
				}

				contents =
					contents.substr(0, replacementStart) +
					includeFragment +
					contents.substr(replacementEnd);

				var addedCharacters = includeFragment.length;
				var removedCharacters = replacementEnd - replacementStart;
				currentOffset += addedCharacters - removedCharacters;
			});

			grunt.log.debug('Writing output...');
			grunt.file.write(file.dest, contents);
			grunt.log.writeln('File "' + file.dest + '" created.');
		});
	});
};
