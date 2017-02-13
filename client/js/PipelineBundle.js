define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

    var TextureCreator = goo.TextureCreator;
    var Texture = goo.Texture;

        var PipelineBundle = function(srcUrl, onLoaded) {
            this.srcUrl = srcUrl;
            this.subscribe(onLoaded);
        };

        PipelineBundle.prototype.subscribe = function(onLoaded) {

            var pipelineError = function(src, err) {
                console.log("FX texture error", src, err);
            };

            var pipedBundle = function(src, data) {
                console.log("piped", src, data);
                onLoaded(data);
            };

            PipelineAPI.initBundleDownload(this.srcUrl, pipedBundle, pipelineError);
        };
        
        return PipelineBundle
    });