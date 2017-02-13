


DataHub = function() {
	this.sources = {};
	this.configs = {};
};


DataHub.prototype.readSource = function(sourceId, config, data, clientId) {

	if (!this.sources[sourceId]) {
		 console.log("No Set Source", sourceId)
	} else {
		return this.sources[sourceId].fetch(config.method, config.args, data, clientId);
	}

};

DataHub.prototype.getConfig = function(configName) {
	console.log("get conf", this.configs[configName])
	return this.configs[configName];
};

DataHub.prototype.getConfigs = function() {

	return this.configs;
};


DataHub.prototype.setConfig = function(config) {

	// var config = JSON.parse(jsonConfig);
	
		for (var key in config) {
			if (!this.configs[config.dataType]) {
				this.configs[config.dataType] = {};
				console.log("set config key", config.dataType)
			}

			if (typeof(config[key]) != 'string') {
				for (var dataType in config[key]) {
					this.configs[config.dataType][dataType] = config[key][dataType];
				}
			}
		}

};


DataHub.prototype.setSource = function(sourceId, object) {
	this.sources[sourceId] = object;
};



DataHub.prototype.handleMessage = function(id, data) {


};