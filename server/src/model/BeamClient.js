var zerorpc = require('zerorpc');
var Promise = require('bluebird');
var _ = require('underscore');
var vm = require('vm');

var FuncNotFound = require('./FuncNotFound');

function BeamClient(url) {
    this.functions = {};
    this.connected = false;

    // connect the server
    this.client = new zerorpc.Client();
    this.client.connect(url);
    this.client = Promise.promisifyAll(this.client);
}

BeamClient.prototype.call = function(methodName, params) {
    return this.client.invokeAsync(methodName, params)
        .then(function(res, more) {
            return res;
        });
};

BeamClient.prototype.disconnect = function() {
    this.client = null;
    this.connected = false;
};

module.exports = BeamClient;
