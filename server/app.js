var express = require('express');
var bodyParser = require('body-parser');

var path = require('path');
var _ = require('underscore');
var routes = require('./src/routes');
var app = express();

console.log('Starting BeamWare Server...');

// set application paths
app.set('views', path.join(__dirname, 'src/views'));
app.set('util', path.join(__dirname, 'src/util'));

// set routes and tell express to accept JSON docs
app.use(bodyParser.json());
app.use('/', routes);

// listen on port 3000
app.listen(3000);
console.log('Started! Listening on port 3000.');

process.on('SIGINT', function() {
    console.log('Recevied SIGINT, exiting...');
    process.exit(0);
});

// export the app
module.exports = app;
