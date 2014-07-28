var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');
var _ = require('underscore');
var logger = require('winston');
var fs = Promise.promisifyAll(require('fs'));

var BeamClient = require('./BeamClient');
var ex = require('../exceptions');

function BeamServer() {
    this.clients = {};

    // attempt a load from memory
    this.load();
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
        if (client.name === undefined || client.url === undefined) {
            return;
        }

        clientList.push({
            name: client.name,
            url: client.url
        });
    });

    var data = JSON.stringify(clientList);
    return fs.writeFileAsync('./data/clients.json', data);
};

BeamServer.prototype.load = function() {
    var self = this;

    // connect to every file found in clients.json
    return fs.readFileAsync('./data/clients.json')
            .then(function(data) {
                data = JSON.stringify(data);

                _.forEach(data, function(client) {
                    self.connect(client.name, client.url);
                });
            })
            .catch(function(err) {
                logger.warn(err);
                logger.warn('Failed to find a clients.json');
                logger.warn('This is OK if the app is being run for the first time');
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
