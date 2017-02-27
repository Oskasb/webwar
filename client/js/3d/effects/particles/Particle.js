

"use strict";

define([],
    function() {

        var Particle = function(particleIndex) {
            this.particleIndex = particleIndex;
            this.buffers = {};
            this.attributes = {};
        };
        
        Particle.prototype.bindAttribute = function(name, dimensions, bufferArray) {
            this.buffers[name] = bufferArray;
            this.attributes[name] = this.particleIndex*dimensions;
        };

        Particle.prototype.setAttribute1D = function(name, value) {
            this.buffers[name][this.attributes[name]] = value;
        };

        Particle.prototype.setAttribute2D = function(name, value1, value2) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
        };

        Particle.prototype.setAttribute3D = function(name, value1, value2, value3) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
        };

        Particle.prototype.setAttribute4D = function(name, value1, value2, value3, value4) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
            this.buffers[name][this.attributes[name]+3] = value4;
        };
                
        return Particle;

    });