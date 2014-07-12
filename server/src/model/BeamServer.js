var zerorpc = require('zerorpc');
var Promise = require('bluebird');

var BeamClient = require('./BeamClient');
var NotConnected = require('./NotConnected');

function BeamServer() {
    this.clients = {};
}

BeamServer.prototype.connect = function(name, url) {
    if (this.clients[name] !== undefined) {
        throw new Error('409');
    }

    var client = new BeamClient(url);

    // save away the clients variable
    this.clients[name] = client;

    return client;
};

module.exports = BeamServer;
