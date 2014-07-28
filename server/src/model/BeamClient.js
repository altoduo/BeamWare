var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;

var ex = require('../exceptions');
var ControlNames = require('../names');

_.extend(BeamClient.prototype, EventEmitter.prototype);
function BeamClient(url) {
    var self = this;

    console.log('Creating a new BeamClient with url: ' + url);

    this.functions = {};
    this.functions[ControlNames.listFunctions] = {args: []};
    this.connected = true;

    // connect the server - use heartbeat interval of 250ms
    this.client = new zerorpc.Client({heartbeatInterval: 250});
    this.client.connect(url);
    this.client = Promise.promisifyAll(this.client);

    // default interval is 10 seconds
    this.heartbeatInterval = 10*1000;

    // enable when client side has this supported
    function heartbeatLoop() {
        return Promise
            .delay(self.heartbeatInterval)
            .then(function() {
                return self.call(ControlNames.heartbeat);
            })
            .catch(function(err) {
                // disconnect on any error received
                self.disconnect();
            })
            .then(heartbeatLoop);
    }
    heartbeatLoop();

    // attempt handshake after a couple of seconds
    // XXX this is a race condition and needs to be fixed
    Promise.delay(5000)
        .then(function() {
            console.log('getting list of functions...');
            self.call(ControlNames.listFunctions, [])
            .then(function(result) {
                console.log('Got list of functions...');
                self.functions = JSON.parse(result);
                self.connected = true;
            });
        });
}

BeamClient.prototype.call = function(methodName, args) {
    var self = this;

    var fn = this.functions[methodName];
    if (fn === undefined) {
        throw new ex.FuncNotFoundError();
    }

    // if args is undefined, set it to a blank array
    args = args || [];

    if (args.length !== fn.args.length) {
        throw new ex.InvalidRequestError();
    }
    if (!this.connected) {
        throw new ex.NotConnectedError();
    }

    // return a promise of the invoked function
    return this.client.invokeAsync(methodName, args)
        .then(function(res, more) {
            return res[0];
        })
        .catch(function(e) {
            if (methodName === ControlNames.heartbeat) {
                throw e;
            }

            console.log('there was an error');
            console.log(e);

            self.connected = false;
            throw e;
        });
};

BeamClient.prototype.disconnect = function() {
    console.log('disconnecting');

    this.client = null;
    this.connected = false;

    this.emit('disconnect');
};

module.exports = BeamClient;
