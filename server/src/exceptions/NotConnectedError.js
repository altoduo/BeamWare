function NotConnectedError() {
    this.name = "NotConnectedError";
    this.level = "Show Stopper";
    this.message = "ZeroRPC client not connected to the server!";
    this.toString = function(){return this.name + ": " + this.message;};
}

module.exports = NotConnectedError;
