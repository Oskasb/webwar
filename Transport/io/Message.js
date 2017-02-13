
Message = function(key, config) {
    this.key = key;
    this.config = config;

    for (var key in config) {
        this[key] = config[key];
    }
};

Message.prototype.call = function(respond, data, dataHub, clientId) {
    if (this.reflect) {
        respond(dataHub.readSource(this.source, this.config, data, clientId));
    } else {
        dataHub.readSource(this.source, this.config, data, clientId)
    }
};

Message.prototype.response = function(res, messageCallback) {
    messageCallback(this.target, res);
};

Message.prototype.make = function(data) {
    return JSON.stringify({id:this.key, data:data});
};