# grunt-include-source

> Include your sources into your HTML files automatically. Also supports including Bower components that expose their source files via the *sources* property in the `bower.json` file.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-include-source --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-include-source');
```

## The "includeSource" task

### Overview
In your project's Gruntfile, add a section named `includeSource` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  includeSource: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.basePath
Type: `String`
Default value: `''`

The base path to use when expanding files.

#### options.baseUrl
Type: `String`
Default value: `''`

The base URL to use for included files in the final result.
For example, setting `baseUrl` to `public/` will result in files being included from `public/path/to/your/file`.

#### options.template
Type: `String|Object`

The templates for sources included in `html`, `scss`, `less` files. Definition of single template overrides its default equivalent only.

Example:
```js
includeSource: {
  options: {
    basePath: 'app',
    includePath: 'public/',
    template: {
      html: {
        js: '<script src="{filePath}"></script>',
        css: '<link rel="stylesheet" type="text/css" th:href="@{{filePath}}}" />',
      },
      scss: {
        scss: '@import "{filePath}";',
        css: '@import "{filePath}";',
      },
      less: {
        less: '@import "{filePath}";',
        css: '@import "{filePath}";',
      }
    }
  },
  myTarget: {
    files: {
      'dist/index.html': 'app/index.tpl.html'
    }
  }
}
```

As it was mentioned above, it is possible to override only necessary templates. 

Example (using Thymeleaf template engine):
```js
includeSource: {
  options: {
    basePath: 'app',
    includePath: 'public/',
    template: {
      html: {
        js: '<script type="text/javascript" th:src="@{{filePath}}}"></script>'
        // or css: '<link rel="stylesheet" type="text/css" th:href="@{{filePath}}}" />'
      }
    }
  },
  myTarget: {
    files: {
      'dist/index.html': 'app/index.tpl.html'
    }
  }
}
```


### Include syntax
Currently supported: `html`, `scss` and `less`

#### HTML syntax
`<!-- include: options_go_here_as_json -->`

#### SCSS and LESS syntax
`// include: options_go_here_as_json`

#### include.type
The type of files that are being included.
Currently supported: `html`, `css`, `scss`, `less`

#### include.bower
Include files of the specified Bower component. The component should have a `bower.json` meta data with a property called `sources`.
This property should contain the files grouped by type, which are passed through the `grunt.file.expand` method.

Example:
```js
{
  "name": "package.name",
  ...
  "sources": {
    "js": [
      "src/scripts/**/*.js",
      "lib/compiled-templates.js"
    ],
    "css": "src/styles/**/*.css"
  }
}
```

#### include.files
Include the given files. Files are passed through the `grunt.file.expand` method.

#### include.basePath
Set to override the `basePath` set in the options.

#### include.baseUrl
Set to override the `baseUrl` set in the options.

### Usage Examples
Configure your task like this:

```js
grunt.initConfig({
  includeSource: {
    options: {
      basePath: 'app',
      includePath: 'public/'
    },
    myTarget: {
      files: {
        'dist/index.html': 'app/index.tpl.html'
      }
    }
  }
})
```

The file `index.tpl.html` could contain, for example:
```html
<!doctype html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Index</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <!-- 
          Automatically include Bower components. Use the "sources" object in your bower.json
          to specify which source files are which.
        -->
        <!-- include: "type": "css", "bower": "yourComponent" -->
        
        <!--
          Include CSS files from a "tmp" directory, put there by another task.
          This shows how to override the default "basePath" set in the options.
        -->
        <!-- include: "type": "css", "basePath": "tmp", "files": "styles/**/*.css" -->
    </head>
    <body>
        <!-- include: "type": "js", "bower": "yourComponent" -->
        <!-- include: "type": "js", "files": "scripts/**/*.js" -->
    </body>
</html>
```
And the resulting file `index.html` will look something like:
```html
<!doctype html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Index</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <!-- 
          Automatically include Bower components. Use the "sources" object in your bower.json
          to specify which source files are which.
        -->
        <!-- include: "type": "css", "bower": "yourComponent" -->
        
        <!--
          Include CSS files from a "tmp" directory, put there by another task.
          This shows how to override the default "basePath" set in the options.
        -->
        <link href="public/styles/main.css" rel="stylesheet" type="text/css" />
        <link href="public/styles/anotherFile.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <script src="public/bower_components/yourComponent/main.js"></script>
        <script src="public/scripts/app.js"></script>
        <script src="public/scripts/anotherFile.js"></script>
        <script src="public/scripts/controllers/evenMore.js"></script>
    </body>
</html>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
