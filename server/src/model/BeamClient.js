var zerorpc = require('zerorpc');
var Promise = require('bluebird');
var _ = require('underscore');
var vm = require('vm');

var FuncNotFound = require('./FuncNotFound');
var NotConnected = require('./NotConnected');

function BeamClient(url) {
    this.functions = {'_functions': {args: []}};
    this.connected = false;

    // connect the server - use heartbeat interval of 250ms
    this.client = new zerorpc.Client({heartBeatInterval: 250});
    this.client.connect(url);
    this.client = Promise.promisifyAll(this.client);

    // attempt handshake
    this.call('_functions')
    .then(function(result) {
        console.log('-- available functions --');
        console.log(result);
        this.functions = JSON.parse(result);

        this.connected = true;
    });
}

BeamClient.prototype.call = function(methodName, params) {
    // make sure client is allowed to call the function
    if (!this.connected) { throw new NotConnected(); }
    if (this.functions[methodName] === undefined) { throw new FuncNotFound(); }

    // return a promise of the invoked function
    return this.client.invokeAsync(methodName, params)
        .then(function(res, more) {
            return res[0];
        })
        .catch(function(e) {
            console.log('there was an error');
            console.log(e);
            throw e;
        });
};

BeamClient.prototype.disconnect = function() {
    this.client = null;
    this.connected = false;
};

module.exports = BeamClient;
