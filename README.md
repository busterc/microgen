# microgen [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/busterc/microgen.svg)](https://greenkeeper.io/)

> micro-generator for individual files, easy like sunday morning

## Yet another generator; how's it different?

- any **file**, anywhere on disk can be a template
  - no need to _install_ templates (like heavy weight project generators)
- easiest way to fill in templates, using simple [handlebars placeholders](http://handlebarsjs.com/)
- no data files required (like other handlebars cli's)
  - you'll be prompted to fill in the data at runtime

## Installation

```sh
$ npm install microgen # --global
```

## Usage

```sh
$ microgen --help

  Usage: microgen <template-file> [output-file]

  Options:

    -h, --help      show usage help
    -p, --pipe      pipe output to stdout, instead of writing to file

    output-file     if not specified, it will be $PWD/<template-file>
                    * if <template-file> has an ".hbs" extension,
                      it will be removed from the output-file name

```

## How does it work?

A microgen template is any **file** that can have [handlebars placeholders](http://handlebarsjs.com/). Microgen will scan the template for placeholders and prompt you to fill in a value for each one.

Supported placeholders:
- Variable `{{some-value}}`
- Block `{{#some-boolean}}something{{else}}something else{{/some-boolean}}`
  - `{{^}}` is the same as `{{else}}`
  - You can use string literals, e.g. `{{#"Are you happy"}}great{{/"Are you happy"}}`
- Comment `{{!some string to display when prompting}}`
  - `{{!--x--}}` is the same as `{{!x}}`
  - `{{!}}` just adds a newline to the display

For example, say you have a `package.json` _template_ file:

```js
{{!
== Let the Good Times Roll ==
}}
{
  "name": "{{name}}",
  "repository": "{{owner}}/{{name}}",
  "description": "{{description}}",
{{!}}{{#"Include Dependencies"}}
  "dependencies": {
{{#assert-dotenv}}
    "assert-dotenv": "3.0.0",{{/assert-dotenv}}{{!}}{{#"Use a CLI Helper [meow, inquirer, commander]"}}{{#meow}}
    "meow": "^3.0.0",{{else}}{{#inquirer}}
    "inquirer": "^1.0.2",{{^}}{{#commander}}
    "commander": "^2.9.0",{{/commander}}{{/inquirer}}{{/meow}}{{/"Use a CLI Helper [meow, inquirer, commander]"}}
  }
{{/"Include Dependencies"}}
}
```

Microgen will prompt you like so:

```sh


== Let the Good Times Roll ==

name: smile
owner: busterc
description: writes :) to stdout

Include Dependencies (Y/n): y
  assert-dotenv (Y/n): y
  
  Use a CLI Helper [meow, inquirer, commander] (Y/n): y
    meow (Y/n): n
      inquirer (Y/n): n
        commander (Y/n): y
```

...and the resulting output file will contain:

```json
{
  "name": "smile",
  "repository": "busterc/smile",
  "description": "writes :) to stdout",

  "dependencies": {
    "assert-dotenv": "3.0.0",
    "commander": "^2.9.0",
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
