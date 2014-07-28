var zerorpc = require('zerorpc-plus');
var Promise = require('bluebird');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');

var ex = require('../exceptions');
var ControlNames = require('../names');

_.extend(BeamClient.prototype, EventEmitter.prototype);
function BeamClient(name) {
    this.name = name;

    this.functions = {};
    this.functions[ControlNames.listFunctions] = {args: []};

    // default interval is 10 seconds
    this.heartbeatInterval = 10*1000;
}

BeamClient.prototype.connect = function(url) {
    var self = this;
    this.url = url;
    logger.info('connecting to ' + url);

    // connect the server - use heartbeat interval of 250ms
    this.rpcClient = new zerorpc.Client({heartbeatInterval: 250});
    this.rpcClient.connect(this.url);
    this.rpcClient = Promise.promisifyAll(this.rpcClient);

    return self.call(ControlNames.listFunctions, [])
            .then(function(result) {
                self.functions = JSON.parse(result);
                self.connected = true;

                logger.info('connected to ' + url + '!');
                self.emit('connect');

                // begin the heartbeat loop
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


            })
            .catch(function(err) {
                // disconnect if there was a failure connecting and continue
                // the error chain
                self.disconnect();

                throw err;
            });
};

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
    if (!this.connected && methodName !== ControlNames.listFunctions) {
        throw new ex.NotConnectedError();
    }

    // return a promise of the invoked function
    return this.rpcClient.invokeAsync(methodName, args)
        .then(function(res, more) {
            return res[0];
        })
        .catch(function(e) {
            if (methodName === ControlNames.heartbeat) {
                throw e;
            }

            logger.error('there was an error');
            logger.error(e);

            self.connected = false;
            throw e;
        });
};

BeamClient.prototype.disconnect = function() {
    this.rpcClient = null;
    this.connected = false;

    this.emit('disconnect');
};

module.exports = BeamClient;
