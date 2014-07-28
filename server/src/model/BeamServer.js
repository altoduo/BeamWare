var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');
var _ = require('underscore');
var logger = require('winston');

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

    var client = new BeamClient();

    // on disconnect, delete from the list of clients
    client.on('disconnect', function() {
        logger.info('disconnecting: ' + name);
        delete self.clients[name];
    });

    // save away the clients variable
    this.clients[name] = client;

    return client.connect(url)
            .then(function() {
                waitForConnect(client);
            });
};

function waitForConnect(client) {
    return Promise.delay(500)
        .then(function() {
            if (client.connected) {
                return;
            } else {
                return waitForConnect(client);
            }
        });
}

module.exports = BeamServer;
