var express = require('express');
var bodyParser = require('body-parser');

var path = require('path');
var _ = require('underscore');
var routes = require('./src/routes');
var app = express();

// set application params
app.set('title', 'Gubbins');
app.set('view engine', 'hbs');

// set application paths
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/views'));
app.set('util', path.join(__dirname, 'src/util'));

// set routes and tell express to accept JSON docs
app.use(bodyParser.json());
app.use('/', routes);

// listen on port 3000
app.listen(3000);

// export the app
module.exports = app;
