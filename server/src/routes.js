var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var BeamServer = require('./model/BeamServer');
var beamServer = new BeamServer();

var Promise = require('bluebird');

router.post('/rpc/registration', function(req, res) {
    // get post information
    var url = req.body.url;
    var name = req.body.name;
    if (url === undefined || name === undefined) {
        res.send(400).end();
        return;
    }

    // connect and assume everything is good
    try {
        beamServer.connect(name, url);
    } catch (e) {
        console.log('misc error: ' + e);
        var code = parseInt(e.message);

        // throw the error if it isn't a simple status code
        if (code === undefined) {
            throw e;
        }

        // send the response
        res.send(code).end();
        return;
    }

    // if connected to RPC ok, send a 201
    res.send(201).end();
});

// returns a list of all rpc servers
router.get('/rpc', function(req, res) {
    res.send(200, Object.keys(beamServer.clients)).end();
});

router.get('/:name/:function', function(req, res) {
    
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
