"use strict";


define([
    'PipelineObject'

], function(
    PipelineObject
) {

    var ParticleDataTexture = function(txId, dataReady) {

        var dataTextureReady = function(src, tx) {
            this.dataTexture = tx;
            dataReady(tx);
        }.bind(this);

        new PipelineObject("THREE_TEXTURE", "data_texture_"+txId, dataTextureReady);

    };
    
    return ParticleDataTexture;

});