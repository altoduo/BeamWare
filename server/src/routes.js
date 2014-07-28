var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var BeamServer = require('./model/BeamServer');
var beamServer = new BeamServer();

var ex = require('./exceptions');

var Promise = require('bluebird');

router.get('/', function(req, res) {
    res.status(200).sendfile('./demo.html');
});

router.post('/rpc/registration', function(req, res) {
    // get post information
    var url = req.body.url;
    var name = req.body.name;
    if (url === undefined || name === undefined) {
        throw new ex.InvalidRequestError();
    }

    // connect and assume everything is good
    try {
        beamServer.connect(name, url);
    } catch (e) {
        console.log('Error while connecting to the host');
        console.log(e.toString());
        var code = parseInt(e.message);

        throw e;
    }

    // if connected to RPC ok, send a 201
    res.status(201).end();
});

// returns a list of all rpc servers
router.get('/rpc', function(req, res) {
    res.send(200, Object.keys(beamServer.clients)).end();
});

router.get('/:name', function(req, res) {
    var name = req.params.name;

    res.set('Access-Control-Allow-Origin', '*');

    // 404 if the client doesn't exist
    var client = beamServer.clients[name];
    if (client === undefined) {
        throw new ex.FuncNotFoundError();
    }

    // send the functions associated with that client
    res.send(200, client.functions).end();
});

router.get('/:name/:function', function(req, res) {
    var name = req.params.name;
    var fn = req.params.function;

    res.set('Access-Control-Allow-Origin', '*');

    // attempt to get the client
    var client = beamServer.clients[name];
    //if (client === undefined) {
    //    throw new ex.FuncNotFoundError();
    //}

    // build up the parameters
    var args = [];
    if (req.query.args !== undefined) {
        // split on comma unless escaped
        args = req.query.args.split(/[^\\],/);
    }

    client.call(fn, args)
    .then(function(result) {
        res.send(200, result);
    })
    .catch(function(err) {
        console.log('there was a zerorpc error');
        res.status(500).end();
    });
});

module.exports = router;
