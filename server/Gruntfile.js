var Promise = require('bluebird');
var fs = require('fs');
var child_process = require('child_process');

module.exports = function(grunt) {

    // initialize the grunt-nodemon configuration
    grunt.initConfig({
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    callback: function(nodemon) {
                        // gets run when server first starts
                        nodemon.on('config:update', function() {
                            PythonControl.start();
                        });

                        // gets run when changes detected
                        nodemon.on('restart', function() {
                            PythonControl.restart();
                        });
                    },

                    watch: ['../'],
                    ext: 'js,py'
                }

            }
        }
    });
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('prepare', function() {
        var child = child_process.spawn('mkdir', ['./data']);
        var done = this.async();

        setTimeout(function() {
            done();
        }, 500);

    });

    grunt.registerTask('run', function() {
        grunt.task.run(['prepare']);

        var filename = grunt.option('logfile');
        if (filename) {
            if (filename === true) {
                filename = './data/server.log';
            }

            var logStream = fs.createWriteStream(filename);
            process.stdout.pipe(logStream);
            process.stderr.pipe(logStream);
        }

        // start up the server
        var Server = require('./app');
        grunt.task.run(['keepalive']);
    });

    grunt.registerTask('keepalive', function() {
        // stay alive forever
        setInterval(function(){}, 60*60*1000);
        this.async();
    });

    grunt.registerTask('dev', function(name) {
        if (name) {
            PythonControl.app = name;
        } else {
            PythonControl.app = "my_app.py";
        }

        grunt.task.run(['prepare', 'nodemon']);
    });
};

var PythonControl = {
    restart: function() {
        // kill the current process
        this.pythonProcess.kill('SIGKILL');

        this.start();
    },

    start: function() {
        if (!this.app) {
            throw new Error('Need to provide application name');
        }

        var self = this;
        // spawn the python process
        Promise.delay(2500)
        .then(function() {
            console.log('Starting up python client application');

            // open up a logging file
            var logStream = fs.createWriteStream('./data/client.log');

            self.pythonProcess = child_process.spawn('python2', ['../SampleApp/' + self.app]);
            self.pythonProcess.stdout.pipe(logStream);
            self.pythonProcess.stderr.pipe(logStream);

            self.pythonProcess.on('exit', function(code) {
                if (code !== 0) {
                    console.log('Client App stopped running!');
                }
            });
        });
    }
};
