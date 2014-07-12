var zerorpc = require('zerorpc');
var Promise = require('bluebird');
var _ = require('underscore');
var vm = require('vm');

var ex = require('../exceptions');

function BeamClient(url) {
    var self = this;

    console.log('Creating a new BeamClient with url: ' + url);

    this.functions = {'BW_functions': {args: []}};
    this.connected = true;

    // connect the server - use heartbeat interval of 250ms
    this.client = new zerorpc.Client({heartBeatInterval: 250});
    this.client.connect(url);
    this.client = Promise.promisifyAll(this.client);

    // attempt handshake after a couple of seconds
    setTimeout(function() {
        console.log('getting list of functions...');
        self.call('BW_functions', [])
        .then(function(result) {
            console.log('Got list of functions...');
            self.functions = JSON.parse(result);
            self.connected = true;
        });
    }, 5000);
}

BeamClient.prototype.call = function(methodName, params) {
    var self = this;

    // if params is undefined, set it to a blank array
    params = params || [];


    console.log('-- function list --');
    console.log(self.functions);
    console.log('-- function name --');
    console.log(methodName);

    console.log('-- typeof functions --');
    console.log(typeof this.functions);
    console.log(this.functions === self.functions);

    console.log('--keys--');
    console.log(Object.keys(this.functions));

    // make sure client is allowed to call the function
    if (!this.connected) {
        throw new ex.NotConnectedError();
    }
    if (this.functions[methodName] === undefined) {
        console.log('could not find func');
        throw new ex.FuncNotFoundError();
    }

    // return a promise of the invoked function
    return this.client.invokeAsync(methodName, params)
        .then(function(res, more) {
            return res[0];
        })
        .catch(function(e) {
            console.log('there was an error');
            console.log(e);

            self.connected = false;
            throw e;
        });
};

BeamClient.prototype.disconnect = function() {
    this.client = null;
    this.connected = false;
};

module.exports = BeamClient;
