function FuncNotFound() {
    this.name = "FuncNotFound";
    this.level = "Show Stopper";
    this.message = "ZeroRPC server doesn't serve this function!";
    this.toString = function(){return this.name + ": " + this.message;};
}

FuncNotFound.prototype = new Error();

module.exports = FuncNotFound;
