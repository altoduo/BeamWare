var zerorpc = require('zerorpc-plus');
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

    // default timeout is 30 seconds
    this.heartbeatTimeout = 30*1000;

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

BeamClient.prototype.heartbeat = function() {
    var self = this;

    // heartbeat loop will run every time in the interval
    function loop() {
        // break out if the client disconnected externally
        if (self === undefined) {
            return;
        }

        // disconnect if 0 beats in last interval
        if (self.numBeats < 1) {
            self.disconnect();
        }

        self.numBeats = 0;

        return Promise
            .delay(self.heartbeatTimeout)
            .then(loop);
    }

    if (this.promise === undefined) {
        this.numBeats = 0;
        this.promise = loop();
    }

    numBeats++;
};

module.exports = BeamClient;
