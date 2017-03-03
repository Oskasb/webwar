

"use strict";

define([],
    function() {


        function buffer1DEqualsValue(buffer, index, value) {
            if (buffer[index] === value) {
                return true;
            }
        }

        function buffer2DEqualsValues(buffer, index, value1, value2) {
            if (buffer[index] === value1 && buffer[index+1] === value2) {
                return true;
            }
        }

        function buffer3DEqualsValues(buffer, index, value1, value2, value3) {
            if (buffer[index] === value1 && buffer[index+1] === value2 && buffer[index+2] === value3) {
                return true;
            }
        }

        function buffer4DEqualsValues(buffer, index, value1, value2, value3, value4) {
            if (buffer[index] === value1 && buffer[index+1] === value2 && buffer[index+2] === value3 && buffer[index+3] === value4) {
                return true;
            }
        }

        var Particle = function(particleIndex) {
            this.particleIndex = particleIndex;
            this.buffers = {};
            this.attributes = {};
            this.params = {
                position:new THREE.Vector4(),
                velocity:new THREE.Vector4()
            };
            this.progress = 0;
            this.dead = false;
            this.attributeBuffers = {};
        };

        Particle.prototype.initToSimulation = function(pos, vel) {
            this.progress = 0;
            this.addPosition(pos);
            this.addVelocity(vel);
        };
        
        Particle.prototype.addPosition = function(pos) {
            this.params.position.x += pos.x;
            this.params.position.y += pos.y;
            this.params.position.z += pos.z;
        };

        Particle.prototype.addVelocity = function(vel) {
            this.params.velocity.x += vel.x;
            this.params.velocity.y += vel.y;
            this.params.velocity.z += vel.z;
        };


        Particle.prototype.bindAttribute = function(name, dimensions, attributeBuffer) {
            this.buffers[name] = attributeBuffer.array;
            this.attributeBuffers[name] = attributeBuffer;
            this.attributes[name] = this.particleIndex*dimensions;

            if (this.buffers[name].length < this.particleIndex*dimensions) {
                console.warn("particleIndex out of range", name, this.particleIndex, dimensions);
            }
        };
                
        Particle.prototype.setAttribute1D = function(name, value) {
            if (buffer1DEqualsValue(this.buffers[name], [this.attributes[name]], value)) {
                return;
            }
            this.buffers[name][this.attributes[name]] = value;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute2D = function(name, value1, value2) {
            if (buffer2DEqualsValues(this.buffers[name], [this.attributes[name]], value1, value2)) {
                return;
            }
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute3D = function(name, value1, value2, value3) {
            if (!this.buffers[name]) {
                console.log("NO BUFFER AT", this.particleIndex, name, this.buffers, this.attributes[name])
                return;
            }

            if (buffer3DEqualsValues(this.buffers[name], [this.attributes[name]], value1, value2, value3)) {
                return;
            }

            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute4D = function(name, value1, value2, value3, value4) {
            if (buffer4DEqualsValues(this.buffers[name], [this.attributes[name]], value1, value2, value3, value4)) {
                return;
            }

            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
            this.buffers[name][this.attributes[name]+3] = value4;
            this.attributeBuffers[name].needsUpdate = true;
        };
                
        return Particle;

    });