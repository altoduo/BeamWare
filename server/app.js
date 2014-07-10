var zerorpc = require('zerorpc');
var Promise = require('bluebird');

var client = new zerorpc.Client();
client.connect('tcp://192.168.1.104:4242');
client = Promise.promisifyAll(client);

client.invokeAsync("hello", 1)
.then(function(err, res, more) {
    console.log(res);
});
