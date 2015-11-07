# Changelog

Here you can find the changes made over the course of history in the different releases.

## Release History

### 2015-11-07 ver. 0.7.1

* Allow directive in html to use multi lines (see https://github.com/jwvdiermen/grunt-include-source/pull/44)

### 2015-09-19 ver. 0.7.0

* Use global config to parse template variables in baseUrl strings (see https://github.com/jwvdiermen/grunt-include-source/pull/41)
* Fix when the offset is negative, endMarker position calculations fail (see https://github.com/jwvdiermen/grunt-include-source/pull/43)

### 2015-07-10 ver. 0.6.1

* Add support to specify target with include options (see https://github.com/jwvdiermen/grunt-include-source/pull/39)

### 2015-05-24 ver. 0.6.0

* Switch to `grunt.file.expandMapping` to support `rename` and `flatten` options (see https://github.com/jwvdiermen/grunt-include-source/pull/37)
* Support comma separated files pattern as an alternative of specifying an array.

### 2015-02-21 ver. 0.5.1

* Add TypeScript support.

### 2015-02-21 ver. 0.5.0

* Add support to map types to existing supported types

### 2014-12-06 ver. 0.4.5

* Support `basePath` to be an array of paths

### 2014-11-22 ver. 0.4.4

* improve endline detected when scanning for indentation

### 2014-11-22 ver. 0.4.3

* replace `grunt.template.process` with `grunt.config.process` for better support (see https://github.com/jwvdiermen/grunt-include-source/pull/27)

### 2014-10-26 ver. 0.4.2

* bug fix: line endings are not detected when concatenating multiple source files.
* remove redundant "type" attribute in `<script>` tag
* add support for templates in file pattern

### 2014-07-12 ver. 0.4.1

* bug fix: multiple lines are detected as the separator, but is should only look at the first line.

### 2014-07-12 ver. 0.4.0

* add support to overwrite the source file by including an end tag
* detect EOL globally from file when no indentation can be found (e.a. when at the begin of a file)

### 2014-05-04 ver. 0.3.9

* add support for Jade
* make automatic indentation more intelligent by using EOL from context

### 2014-05-03 ver. 0.3.8

* replace all instances of {filePath} instead of the only the first
* add {filePathDecoded} to enable use of raw URL which isn't encoded

### 2014-04-27 ver. 0.3.7

* DEPRECATED: Bower support, see readme.
* support for HAML (see https://github.com/jwvdiermen/grunt-include-source/pull/17)
* tags generated for HTML now use HTML5 syntax by default.
* added basic tests
* updated dependencies.

### 2014-04-18 ver. 0.3.6

* added support for `include.ordering` option. 
* added automated indentation for included entries (see https://github.com/jwvdiermen/grunt-include-source/issues/14)
