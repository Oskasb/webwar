define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

        var PipelineObject = function(category, key, onDataCallback, defaultValue) {
            this.category = category;
            this.key = key;
            this.data = {};
            this.configs = {};

            if (defaultValue != undefined) {
                this.setData(defaultValue);
            }
            this.subscribe(onDataCallback);
        };

        PipelineObject.prototype.subscribe = function(onDataCallback) {

            var dataCallback = function(src, data) {
                if (data == src && data) {
                    console.log("No data at source", this.category, src, data)
                } else {
                    this.data = data;
                    if (typeof(onDataCallback) == 'function') {
                        onDataCallback(src, data);
                    }
                }
            }.bind(this);

            this.dataCallback = dataCallback;

            PipelineAPI.subscribeToCategoryKey(this.category, this.key, dataCallback);
        };
        
        PipelineObject.prototype.buildConfig = function(dataName) {

            if (!dataName) dataName = 'data';

            this.data = this.readData();
            this.configs = {};

            if (this.data.length) {
                for (var i = 0; i < this.data.length; i++) {
                    this.configs[this.data[i].id] = this.data[i][dataName];
                }
            } else {
                console.log("Data not Array Type", this.category, this.key, this.data)
            }

            return this.configs;
        };

        PipelineObject.prototype.setData = function(data) {
            PipelineAPI.setCategoryKeyValue(this.category, this.key, data);
        };


        PipelineObject.prototype.readData = function() {
            return PipelineAPI.readCachedConfigKey(this.category, this.key);
        };

        PipelineObject.prototype.removePipelineObject = function() {
            return PipelineAPI.removeCategoryKeySubscriber(this.category, this.key, this.dataCallback);
        };

        return PipelineObject
    });