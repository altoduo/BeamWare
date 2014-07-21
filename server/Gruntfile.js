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

var child_process = require('child_process');
var pythonProcess;

function launchPythonClient() {
    // spawn the python process
    setTimeout(function() {
        pythonProcess = child_process.spawn('python2', ['../SampleApp/my_app.py'], {
            stdio: 'inherit'
        });
    }, 2500);
}

function restartPythonClient() {
    // kill the current process
    pythonProcess.kill('SIGKILL');

    launchPythonClient();
}
