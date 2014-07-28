var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');

var BeamClient = require('./BeamClient');
var ex = require('../exceptions');

function BeamServer() {
    this.clients = {};
}

BeamServer.prototype.connect = function(name, url) {
    var self = this;

    // get rid of naming conflicts
    if (this.clients[name] !== undefined) {
        throw new ex.NameConflictError();
    } else if (name === 'rpc') {
        throw new ex.NameConflictError();
    }

    var client = new BeamClient(url);

    // on disconnect, delete from the list of clients
    client.on('disconnect', function() {
        console.log('recieved a disconnect signal!');
        delete self.clients[name];
    });

    // save away the clients variable
    this.clients[name] = client;

    return client;
};

module.exports = BeamServer;
