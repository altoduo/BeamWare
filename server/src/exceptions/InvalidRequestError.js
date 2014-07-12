function InvalidRequestError() {
    this.name = "InvalidRequestError";
    this.code = 400;
    this.message = "HTTP client made an invalid request";
    this.toString = function(){return this.name + ": " + this.message;};
}

InvalidRequestError.prototype = new Error();

module.exports = InvalidRequestError;
