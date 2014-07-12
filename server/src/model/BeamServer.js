var zerorpc = require('zerorpc');
var Promise = require('bluebird');

var BeamClient = require('./BeamClient');
var ex = require('../exceptions');

function BeamServer() {
    this.clients = {};
}

BeamServer.prototype.connect = function(name, url) {
    // get rid of naming conflicts
    if (this.clients[name] !== undefined) {
        throw new ex.NameConflictError();
    } else if (name === 'rpc') {
        throw new ex.NameConflictError();
    }

    var client = new BeamClient(url);

    // save away the clients variable
    this.clients[name] = client;

    return client;
};

module.exports = BeamServer;
