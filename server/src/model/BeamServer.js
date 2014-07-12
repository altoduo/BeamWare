var zerorpc = require('zerorpc');
var Promise = require('bluebird');

var BeamClient = require('./BeamClient');
var NotConnected = require('./NotConnected');

function BeamServer() {
    this.clients = [];
}

BeamServer.prototype.connect = function(url) {
    var self = this;
    var client = new BeamClient(url);

    return client;
};

module.exports = BeamServer;
