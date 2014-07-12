var zerorpc = require('zerorpc');
var Promise = require('bluebird');

function BeamServer() {
    var server = {};

    // init function
    server.init = function() {
        this.rpcClients = [];
    };

    server.connect = function(url) {
        // create a client and try to connect
        var client = new zerorpc.Client();
        client.connect(url);
        Promise.promisifyAll(client);

        // get registered functions

        console.log(JSON.stringify(client));

    };

    return server;
}

module.exports = BeamServer;
