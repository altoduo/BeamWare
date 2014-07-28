var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');
var _ = require('underscore');
var logger = require('winston');
var fs = Promise.promisifyAll(require('fs'));

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

    var client = new BeamClient(name);
    this.eventify(client);

    // save away the clients variable
    this.clients[name] = client;

    return client.connect(url)
            .then(function() {
                waitForConnect(client);
            });
};

BeamServer.prototype.eventify = function(client) {
    var self = this;

    // on disconnect, delete from the list of clients
    client.on('disconnect', function() {
        logger.info('disconnecting: ' + self.name);
        delete self.clients[self.name];

        // save when a client has disconnected
        self.save();
    });

    // save on connect
    client.on('connect', function() {
        self.save();
    });
};

BeamServer.prototype.save = function() {
    var clientList = [];
    _.forEach(this.clients, function(client) {
        logger.info(client.name);
        logger.info(client.url);
        clientList.push({
            name: client.name,
            url: client.url
        });
    });

    var data = JSON.stringify(clientList);
    return fs.writeFileAsync('./data/clients.json', data);
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
