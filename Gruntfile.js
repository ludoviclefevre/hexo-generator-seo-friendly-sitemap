'use strict';
module.exports = function (grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: ['Gruntfile.js']
            },
            js: {
                src: [
                    //'index.js',
                    'lib/*.js'
                ]
            }
        },
        jscs: {
            src: [
                '<%= jshint.js.src %>',
                'test/*.js',
                '<%= jshint.gruntfile.src %>'
            ]
        },
        escomplex: {
            options: {
                complexity: {
                    logicalor: true,
                    switchcase: true,
                    forin: false,
                    trycatch: false,
                    newmi: true
                },
                format: {
                    showFunctionDetails: false
                }
            },
            src: [
                'lib/**/*.js'
            ]
        },
        mocha_istanbul: {
            coverage: {
                src: 'test'
            },
            coveralls: {
                src: ['test'],
                options: {
                    coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['cobertura', 'lcovonly']
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            js: {
                files: '<%= jshint.js.src %>',
                tasks: ['jshint:js', 'mochacli']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'mochacli']
            }
        }
    });

    grunt.event.on('coverage', function (lcov, done) {
        require('coveralls').handleInput(lcov, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask('test', ['jshint', 'jscs', 'mocha_istanbul:coverage', 'escomplex']);
    grunt.registerTask('travis', ['jshint', 'jscs', 'mocha_istanbul:coveralls']);
    grunt.registerTask('default', 'test');
};
