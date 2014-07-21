module.exports = function(grunt) {

    grunt.initConfig({
        nodemon: {
            dev: {
                script: 'app.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');
};
