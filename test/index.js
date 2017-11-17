'use strict';

var exec = require('child_process').exec;
var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var cli = path.resolve(__dirname, '../index.js');
var templateFile = path.resolve(__dirname, 'template.file');
var templateFile2 = path.resolve(__dirname, 'template.file2');
var templateFile2Output = path.resolve(__dirname, 'output/template.file2');
var templateFile3 = path.resolve(__dirname, 'template.file3.hbs');
var templateFile3Output = path.resolve(__dirname, 'output/template.file3');
var outputAllFile = path.resolve(__dirname, 'output/output-all.file');
var outputSomeFile = path.resolve(__dirname, 'output/output-some.file');
var outputDirectory = path.resolve(__dirname, 'output/');

test('validate output file has all answers', t => {
  t.plan(13);

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
    'mushrooms\r', // yucky-food
    '\r', // funny
    'n\r', // Pile On
    'n\r', // Dig Shallow
    '\r' // Real Deep
  ];

  command.stdout.on('data', data => {

    // test indent
    if (data.match('  info:')) {
      t.pass();
    }

    // test sub-indent
    if (data.match('    yucky-food:')) {
      t.pass();
    }

    // test comment display
    if (data.match('adios amigos')) {
      t.pass();
      return;
    }

    if (data.match(/\r?\n/)) {
      // empty lines, etc.
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
      'yucky food: mushrooms',
      'LOL',
      'You cannot dig out of a hole',
      '¯\\_(ツ)_/¯'
    ];

    expected.forEach(value => {
      if (outputContents.indexOf(value) > -1) {
        t.pass();
      }
    });
  });
});

test('validate output file has only some answers', t => {
  t.plan(12);

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
    'n\r', // likes
    'n\r', // funny
    'n\r', // sexy
    '\r', // boring
    'n\r', // Pile On
    'n\r', // Dig Shallow
    'n\r' // Real Deep
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
      'description: bootylicous',
      'huh, sorry, i fell asleep',
      'what\'s the point then'
    ];

    var unexpected = [
      '| | | | | | | (__| | | (_) | (_| |  __/ | | |', // ascii-art
      'more info:',
      'yummy food:',
      'yucky food:',
      'LOL',
      'ahh yeah',
      'You cannot dig out of a hole'
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

test('unspecified output file writes to CWD', t => {
  t.plan(2);

  var command = exec(`node ${cli} ${templateFile2}`, {
    cwd: outputDirectory,
    stdio: 'pipe'
  });

  command.stdout.on('data', data => {
    if (data.match('Working Hard')) {
      t.pass();
    }

    command.stdin.end();
  });

  command.on('close', () => {
    var outputContents = fs.readFileSync(templateFile2Output, 'utf8');

    var expected = [
      'Hardly Working'
    ];

    expected.forEach(value => {
      if (outputContents.indexOf(value) > -1) {
        t.pass();
      }
    });
  });
});

test('unspecified output file writes to CWD, removing ".hbs" extension', t => {
  t.plan(2);

  var command = exec(`node ${cli} ${templateFile3}`, {
    cwd: outputDirectory,
    stdio: 'pipe'
  });

  command.stdout.on('data', data => {
    if (data.match('I can ride my bike with no handlebars')) {
      t.pass();
    }

    command.stdin.end();
  });

  command.on('close', () => {
    var outputContents = fs.readFileSync(templateFile3Output, 'utf8');

    var expected = [
      'No Handlebars'
    ];

    expected.forEach(value => {
      if (outputContents.indexOf(value) > -1) {
        t.pass();
      }
    });
  });
});

test('pipe to stdout', t => {
  t.plan(4);

  ['-p', '--pipe'].map(option => {
    var command = exec(`node ${cli} ${templateFile3} ${option}`, {
      cwd: outputDirectory,
      stdio: 'pipe'
    });

    command.stdout.on('data', data => {
      if (data.match('I can ride my bike with no handlebars')) {
        t.pass();
      }
      if (data.match('No Handlebars')) {
        t.pass();
      }
      command.stdin.end();
    });
    return option;
  });
});
