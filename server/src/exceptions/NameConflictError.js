function NameConflictError() {
    this.name = "NameConflictError";
    this.code = 409;
    this.level = "Show Stopper";
    this.message = "There is a naming conflict!";
    this.toString = function(){return this.name + ": " + this.message;};
}

NameConflictError.prototype = new Error();

module.exports = NameConflictError;
