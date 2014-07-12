var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var BeamServer = require('./model/BeamServer');
var beamServer = new BeamServer();

var Promise = require('bluebird');

router.post('/rpc/registration', function(req, res) {
    res.send(200).end();
});

router.get('/test', function(req, res) {
    var client = beamServer.connect('tcp://10.16.22.181:4242');

    client.call('hello', ['colin'])
        .then(function(callRes) {
            console.log('call success!');
            res.send(200, JSON.stringify(callRes)).end();
        })
        .error(function(e) {
            console.log('there was an error');
            console.log(e);
            res.send(500).end();
        });
});

module.exports = router;
