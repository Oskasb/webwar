var fs = require('fs');

ConfigLoader = function(path) {
    this.path = path;
    this.configs = {};
    this.fileWatch = true;
    this.devMode = false;
};

ConfigLoader.prototype.setUpdateCallback = function(dataUpdated) {
    this.updateCallback = dataUpdated;
};

ConfigLoader.prototype.applyFileConfigs = function(configs, devMode) {
  //  return;
    for (var i = 0; i < configs.loadFiles.length; i++) {
        this.registerConfigUrl(configs.loadFiles[i], this.devMode)
    }

      // this.fileWatch = configs.watchFiles;
};

ConfigLoader.prototype.registerConfigUrl = function(configUrl, devMode) {

    this.devMode = devMode;
 //   console.log("Reg Config Url: "+ configUrl+' ' +devMode);
    var dataUpdated = this.updateCallback;
    var path = this.path;
    var data;
    var _this = this;

    if (this.devMode) {
        try {
            data = JSON.parse(fs.readFileSync(path+configUrl+'.json', 'utf8'));
            for (var i = 0; i < data.length; i++) {
                _this.configs[data[i].id] = data[i];
           //     console.log("Config Updated:", data[i].dataType);
                dataUpdated(data[i]);
            }

        } catch (e) {
            console.error("json parse error", e);
        }


        function watchCallback(editType, file) {

            if (editType == 'change') {
                try {
                    data = JSON.parse(fs.readFileSync(path+file, 'utf8'));
                    for (var i = 0; i < data.length; i++) {
                        _this.configs[data[i].id] = data[i];
                        console.log("Config Updated:", data[i].id);
                        dataUpdated(data[i]);
                    }

                } catch (e) {
                    console.error("json parse error", e);
                }
            }
        }

        this.watchConfig(configUrl, watchCallback);
    } else {

        data = JSON.parse(fs.readFileSync(path+configUrl+'.json', 'utf8'));
        for (var i = 0; i < data.length; i++) {
            _this.configs[data[i].id] = data[i];
            console.log("Config Updated:", data);
            dataUpdated(data[i]);
        }

    }




};


ConfigLoader.prototype.watchConfig = function(filename, callback) {
    fs.watch(this.path+filename+'.json', callback);
};

