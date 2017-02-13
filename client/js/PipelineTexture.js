define([
        'PipelineAPI'
    ],
    function(
        PipelineAPI
    ) {

    var TextureCreator = goo.TextureCreator;
    var Texture = goo.Texture;

        var PipelineTexture = function(srcUrl, txLoaded) {
            this.srcUrl = srcUrl;
            this.subscribe(txLoaded);
        };

        PipelineTexture.prototype.subscribe = function(txLoaded) {

            var pipelineError = function(src, err) {
                console.log("FX texture error", src, err);
            };

            var pipedTx = function(src, data) {
    //            console.log("pipedTx", src, data);

                var settings = {
                    minFilter:"NearestNeighborNoMipMaps",
                    wrapS: 'EdgeClamp',
                    wrapT: 'EdgeClamp'
                };

            //    var side = Math.sqrt(data.length / 4);

            //    txLoaded(new Texture(data, settings, side, side));

           //     return;

                new TextureCreator().loadTexture2D(src, settings).then(function(texture) {
                    txLoaded(texture);
                });
            };

            PipelineAPI.cacheImageFromUrl(this.srcUrl, pipedTx, pipelineError);
        };
        
        return PipelineTexture
    });