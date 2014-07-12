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
        console.log('Error while connecting to the host');
        console.log(e.toString());
        var code = parseInt(e.message);

        // throw the error if it isn't a simple status code
        if (typeof code !== 'number' && !isNan(code)) {
            throw e;
        }

        // send bad gateway if can't connect to client or the '_functions'
        // doesn't exist
        if (e.name === 'NotConnected' || e.name === 'FuncNotFound') {
            res.send(502).end();
            return;
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

router.get('/:name', function(req, res) {
    var name = req.params.name;

    var client = beamServer.clients[name];
    if (client === undefined) {
        res.send(404).end();
    }

    // send the functions associated with that client
    res.send(200, client.functions).end();
});

router.get('/:name/:function', function(req, res) {
    var name = req.params.name;
    var fn = req.params.function;

    // attempt to get the client
    var client = beamServer.clients[name];
    if (client === undefined) {
        res.send(404).end();
    }

    try {
        client.call(fn, [])
        .then(function(result) {
            res.send(200, result);
        });
    } catch (e) {
        console.log(e);
        res.send(500).end();
    }
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
