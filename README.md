# microgen [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> micro-generator for individual files, easy like sunday morning

## Yet another generator; how's it different?

- any **file**, anywhere on disk can be a template
  - no need to _install_ templates (like heavy weight project generators)
- easiest way to fill in templates, using simple [handlebars placeholders](http://handlebarsjs.com/)
- no data files required (like other handlebars cli's)
  - you'll be prompted to fill in the data at runtime

## Installation

```sh
$ npm install --global microgen
```

## Usage

```sh
$ microgen --help

  Usage: microgen <template-file> <output-file>

  Options:

    -h, --help    show usage help

```

## How does it work?

A microgen template is any **file** that can have [handlebars placeholders](http://handlebarsjs.com/). Microgen will scan the template for placeholders and prompt you to fill in a value for each one.

Supported Placeholders:
- Variable `{{some-value}}`
- Block `{{#some-boolean}}something{{/some-boolean}}`
- Comment `{{!some string to display when prompting}}`

For example, say you have a `package.json` _template_ file:

```js
{{!
== Let the Good Times Roll ==
}}
{
  "name": "{{name}}",
  "repository": "{{owner}}/{{name}}",
  "description": "{{description}}",
{{!}}{{#include-dependencies}}
  "dependencies": {
{{#assert-dotenv}}
    "assert-dotenv": "3.0.0",
{{/assert-dotenv}}
{{#meow}}
    "meow": "^3.0.0",
{{/meow}}
  }
{{/include-dependencies}}
}
```

Microgen will prompt you like so:

```sh


== Let the Good Times Roll ==

name: smile
owner: busterc
description: writes :) to stdout

include-dependencies (Y/n): y
  assert-dotenv (Y/n): y
  meow (Y/n): n
```

...and the resulting output file will contain:

```json
{
  "name": "smile",
  "repository": "busterc/smile",
  "description": "writes :) to stdout",

  "dependencies": {
    "assert-dotenv": "3.0.0",
  }
}
```

## Respect

**microgen** was inspired by [`khaos`](https://github.com/segmentio/khaos)

_If you need heavy weight project scaffolding generators, then look into [`plop`](https://github.com/amwmedia/plop) and [`yo`](https://github.com/yeoman/yo)_

## License

ISC © [Buster Collings](https://about.me/buster)


[npm-image]: https://badge.fury.io/js/microgen.svg
[npm-url]: https://npmjs.org/package/microgen
[travis-image]: https://travis-ci.org/busterc/microgen.svg?branch=master
[travis-url]: https://travis-ci.org/busterc/microgen
[daviddm-image]: https://david-dm.org/busterc/microgen.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/busterc/microgen
