module.exports = function(grunt) {

    grunt.initConfig({
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    callback: function(nodemon) {
                        // gets run when server first starts
                        nodemon.on('config:update', launchPythonClient);

                        // gets run when changes detected
                        nodemon.on('restart', restartPythonClient);
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
var pythonProcess;

function launchPythonClient() {
    // spawn the python process
    Promise.delay(2500)
    .then(function() {
        // open up a logging file
        var logStream = fs.createWriteStream('./myapp.log');

        pythonProcess = child_process.spawn('python2', ['../SampleApp/my_app.py']);
        pythonProcess.stdout.pipe(logStream);
        pythonProcess.stderr.pipe(logStream);

        pythonProcess.on('exit', function(code) {
            if (code !== 0) {
                console.log('Client App stopped running!');
            }
        });
    });
}

function restartPythonClient() {
    // kill the current process
    pythonProcess.kill('SIGKILL');

    launchPythonClient();
}
