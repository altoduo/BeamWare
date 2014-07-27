module.exports = function(grunt) {

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
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');
};

var Promise = require('bluebird');
var fs = require('fs');
var child_process = require('child_process');

var PythonControl = {
    restart: function() {
        // kill the current process
        this.pythonProcess.kill('SIGKILL');

        launchPythonClient();
    },

    start: function() {
        var self = this;
        // spawn the python process
        Promise.delay(2500)
        .then(function() {
            // open up a logging file
            var logStream = fs.createWriteStream('./myapp.log');

            self.pythonProcess = child_process.spawn('python2', ['../SampleApp/my_app.py']);
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
