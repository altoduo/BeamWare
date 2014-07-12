var express = require('express');
var bodyParser = require('body-parser');

var path = require('path');
var _ = require('underscore');
var routes = require('./src/routes');
var app = express();

console.log('Starting BeamWare Server...');

// set routes and tell express to accept JSON docs
app.use(bodyParser.json());
app.use('/', routes);

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
if (true) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('<h2>' + err.message + '</h2>' +
                '<p>' + err + '</p>' +
                '<p>' + err.stack + '</p>');
        res.end();
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// listen on port 3000
app.listen(3000);
console.log('Started! Listening on port 3000.');

process.on('SIGINT', function() {
    console.log('Recevied SIGINT, exiting...');
    process.exit(0);
});

// export the app
module.exports = app;
