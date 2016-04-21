'use strict';

var exec = require('child_process').exec;
var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var cli = path.resolve(__dirname, '../index.js');
var templateFile = path.resolve(__dirname, 'template.file');
var outputAllFile = path.resolve(__dirname, 'output/output-all.file');
var outputSomeFile = path.resolve(__dirname, 'output/output-some.file');

test('make the testing output directory', t => {
  t.plan(1);

  var outputDirectory = path.resolve(__dirname, 'output/');

  mkdirp(outputDirectory, error => {
    if (error) {
      return t.fail();
    }

    t.pass();
  });
});

test('validate output file has all answers', t => {
  t.plan(7);

  var command = exec(`node ${cli} ${templateFile} ${outputAllFile}`, {
    cwd: __dirname,
    stdio: 'pipe'
  });

  var answers = [
    '\r', // basename
    'buster\r', // name
    'testing this out\r', // description
    '\r', // ascii-art
    '\r', // more
    'whatcha know\r', // info
    'y\r', // likes
    'tacos\r', // yummy-food
    'Y\r', // dislikes
    'mushrooms\r' // yucky-food
  ];

  command.stdout.on('data', data => {
    if (data.match(/\r?\n/)) {
      // empty line
      return;
    }

    var answer = answers.shift();
    command.stdin.write(answer);

    if (!answers.length) {
      command.stdin.end();
    }
  });

  command.on('close', () => {
    var outputContents = fs.readFileSync(outputAllFile, 'utf8');

    var expected = [
      'basename: test',
      'name: buster',
      'description: testing this out',
      '| | | | | | | (__| | | (_) | (_| |  __/ | | |', // ascii-art
      'more info: whatcha know',
      'yummy food: tacos',
      'yucky food: mushrooms'
    ];

    expected.forEach(value => {
      if (outputContents.indexOf(value) > -1) {
        t.pass();
      }
    });
  });
});

test('validate output file has only some answers', t => {
  t.plan(7);

  var command = exec(`node ${cli} ${templateFile} ${outputSomeFile}`, {
    cwd: __dirname,
    stdio: 'pipe'
  });

  var answers = [
    'all-about-that-base\r', // basename
    'badonkadonk\r', // name
    'bootylicous\r', // description
    'n\r', // ascii-art
    'n\r', // more
    'n\r' // likes
  ];

  command.stdout.on('data', data => {
    if (data.match(/\r?\n/)) {
      // empty line
      return;
    }

    var answer = answers.shift();
    command.stdin.write(answer);

    if (!answers.length) {
      command.stdin.end();
    }
  });

  command.on('close', () => {
    var outputContents = fs.readFileSync(outputSomeFile, 'utf8');

    var expected = [
      'basename: all-about-that-base',
      'name: badonkadonk',
      'description: bootylicous'
    ];

    var unexpected = [
      '| | | | | | | (__| | | (_) | (_| |  __/ | | |', // ascii-art
      'more info:',
      'yummy food:',
      'yucky food:'
    ];

    expected.forEach(value => {
      if (outputContents.indexOf(value) > -1) {
        t.pass();
      }
    });

    unexpected.forEach(value => {
      if (outputContents.indexOf(value) === -1) {
        t.pass();
      }
    });
  });
});
