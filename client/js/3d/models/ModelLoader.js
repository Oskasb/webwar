define([
        'Events',
        'PipelineBundle',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineBundle,
        PipelineAPI
    ) {

        var bundleMasterUrl = './client/json/bundles/bundle_list.json';
        var resourcePath = '';

        var bundleConfigs = {};

        function ModelLoader(goo) {
            this.loadedEntities = {};
            this.preloadBundleData(goo);


            var attachBundleEntity = function(clonedEntity, parent) {
                console.log("New Clone:",clonedEntity.name);
            //    clonedEntity.transformComponent.transform.rotation.rotateX(Math.PI*0.5);
                parent.transformComponent.attachChild(clonedEntity.transformComponent);
                clonedEntity.addToWorld();
            }.bind(this);


            var handleBuildPiece = function(e) {

                var parent = evt.args(e).parent;
                var callback = function(clonedEntity) {
                    attachBundleEntity(clonedEntity, parent);
                };

                var pieceName = evt.args(e).entityName;
                //		PipelineAPI.cloneLoadedGooEntity(pieceName, callback);
                //	};

                var buildEntity = function(eName) {
                    var buildFunc = this.loadedEntities[eName].build;
                    return function() {
                        buildFunc(eName, callback);
                    }
                }.bind(this);

                buildEntity(pieceName)();
            }.bind(this);


            evt.on(evt.list().ATTACH_BUNDLE_ENTITY, handleBuildPiece);

        }


        ModelLoader.prototype.preloadBundleData = function(goo) {


            var onLoaded = function(bundles) {
                console.log("Bundles onLoad OK", bundles)
            }
            
            this.runGooPipeline(resourcePath, goo, bundleMasterUrl, onLoaded);
            
        };



        ModelLoader.prototype.runGooPipeline = function(path, goo, bundleMasterUrl, loadingProgressDone) {
            
            var bundlesReady = function(sourceKey, res) {
                console.log("Bundle update OK", sourceKey, res);

                if (this.loadedEntities["sherman"] && this.loadedEntities["ground"]) {
                    
                    evt.fire(evt.list().BUNDLES_READY, {});

                }

            }.bind(this);

            var bundleFail = function(err) {
                console.error("Bundle update FAIL:", err);
            };

            var bundles = function() {
            //    this.notifyUpdate(loadingProgressDone);
                this.initBundleData(path, goo, bundleMasterUrl, bundlesReady, bundleFail);
            }.bind(this);

            setTimeout(function(){
                bundles()
            }, 25)

        };

        ModelLoader.prototype.handleBundleUpdated = function(entityName) {
            console.log("BundleUpdated:", entityName);
        };

        ModelLoader.prototype.initBundleData = function(path, goo, srcUrl, downloadOk, fail) {

            var notifyLoaderProgress = function(handled, total) {
                console.log("Bundle Progress", handled, total)
            }.bind(this);

            var assetUpdated = function(entityName, data) {
                this.loadedEntities[entityName] = data;
                this.handleBundleUpdated(entityName);
                downloadOk(entityName, data);
            }.bind(this);
            PipelineAPI.initBundleDownload(path, goo, srcUrl, assetUpdated, fail, notifyLoaderProgress);
        };



        

        return ModelLoader;
    });