#!/usr/bin/env node

'use strict';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '-h' || args[0] === '--help' || args.length < 2) {
  console.log('\n  Usage: microgen <template-file> <output-file>\n');
  console.log('  Options:\n\n    -h, --help    show usage help\n');
  process.exit(1);
}

var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var templateFile = args[0];
var outputFile = args[1];
var basename = path.basename(process.cwd());
var template;
try {
  template = fs.readFileSync(templateFile, 'utf8');
} catch (error) {
  console.log(`\n  Error: there was a problem reading ${templateFile}`);
  process.exit(1);
}

var ast = Handlebars.parse(template).body;
var prompts = {};
var answers = {};
var id;

function prepare(ast, parent) {
  ast.forEach(statement => {
    switch (statement.type) {
      case 'CommentStatement':
        id = `comment-${Math.random().toString(16).slice(2)}`;

        if (parent[id]) {
          return;
        }

        parent[id] = {
          type: 'comment',
          value: statement.value
        };
        break;
      case 'MustacheStatement':
        id = statement.path.original;

        if (parent[id]) {
          return;
        }

        parent[id] = {
          type: 'string'
        };
        break;
      case 'BlockStatement':
        id = statement.path.original;

        if (!parent[id]) {
          parent[id] = {
            type: 'boolean'
          };
        }

        if (statement.program.body) {
          prepare(statement.program.body, parent[id]);
        }

        if (statement.inverse && typeof statement.inverse === 'object') {
          parent[id].inverse = {
            // type: 'inverse'
          };
          prepare(statement.inverse.body, parent[id].inverse);
        }

        break;
      default:
        // carry on
        break;
    }
  });
}

prepare(ast, prompts);

if (prompts.basename && prompts.basename.type === 'string') {
  prompts.basename.value = basename;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('');

var ids = Object.keys(prompts);
(function ask(ids, parent, depth, callback) {
  let id = ids.shift();
  if (!id) {
    return callback(null);
  }

  // this is just for display
  var indent = '';
  var _depth = 0;
  while (_depth < depth) {
    indent += '  ';
    _depth++;
  }

  var variable = parent[id];
  var defaultValue;
  var defaultChoices;

  switch (variable.type) {
    case 'boolean':
      defaultChoices = ' (Y/n)';
      break;
    case 'comment':
      console.log(`${indent}${variable.value}`);
      return ask(ids, parent, depth, callback);
    default: // string
      defaultValue = variable.value ? `${variable.value}` : '';
      defaultChoices = defaultValue.length ? ` (${defaultValue})` : '';
      break;
  }

  rl.question(`${indent}${id}${defaultChoices}: `, answer => {
    answer = answer.trim();

    switch (variable.type) {
      case 'boolean':
        var dig;
        answers[id] = dig = answer !== 'n';

        var digIds;
        if (dig) {
          digIds = (Object.keys(variable)).filter(value => {
            return value !== 'type' && value !== 'value' && value !== 'inverse';
          });

          depth++;

          return ask(digIds, variable, depth, error => {
            if (error) {
              throw error;
            }

            depth--;

            ask(ids, parent, depth, callback);
          });
        }

        // inverse / else clause
        if (variable.inverse && typeof variable.inverse === 'object' && Object.keys(variable.inverse).length) {
          digIds = (Object.keys(variable.inverse)).filter(value => {
            return value !== 'type' && value !== 'value';
          });

          depth++;

          return ask(digIds, variable.inverse, depth, error => {
            if (error) {
              throw error;
            }

            depth--;

            ask(ids, parent, depth, callback);
          });
        }

        ask(ids, parent, depth, callback);
        break;
      case 'string':
        answers[id] = answer.length ? answer : defaultValue;
        ask(ids, parent, depth, callback);
        break;
      default:
        // carry on
        break;
    }
  });
})(ids, prompts, 0, error => {
  if (error) {
    throw error;
  }

  rl.close();
  var result = Handlebars.compile(template)(answers);
  fs.writeFileSync(outputFile, result, 'utf8');
});
