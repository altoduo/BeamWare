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

    // default interval is 30 seconds
    this.heartbeatInterval = 30*1000;

    // enable when client side has this supported
    function heartbeatLoop() {
        try {
            self.call('_heartbeat');
        } catch(err) {
            console.log('client heartbeat error');
            console.log(err);
            return;
        }

        return Promise
                .delay(self.heartbeatInterval)
                .then(heartbeatLoop);
    }
    //heartbeatLoop();

    // attempt handshake after a couple of seconds
    Promise.delay(5000)
        .then(function() {
            console.log('getting list of functions...');
            self.call('BW_functions', [])
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
