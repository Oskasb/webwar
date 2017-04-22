

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
            this.usedCount = 0;
            this.particleIndex = particleIndex;
            this.buffers = {};
            this.attributes = {};


            this.posOffset = new THREE.Vector3();
            this.velVec = new THREE.Vector4();
            this.posVec = new THREE.Vector4();

            this.quat = new THREE.Quaternion();

            this.systemTime = {value:0};


            this.params = {
                position:this.posVec,
                velocity:this.velVec,
                quaternion:this.quat,
                systemTime:this.systemTime,
                acceleration:new THREE.Vector4()
            };

            this.progress = 0;
            this.dead = false;
            this.attributeBuffers = {};
        };

        Particle.prototype.setStartTime = function(systemTime) {
            this.progress = 0;
            this.systemTime = {value:systemTime};
            this.params.systemTime.value = systemTime;
        };

        Particle.prototype.initToSimulation = function(systemTime, pos, vel) {
            this.usedCount++;
            this.addPosition(pos);
            this.addVelocity(vel);
            this.setStartTime(systemTime);
        };
        
        Particle.prototype.addPosition = function(pos) {
            this.params.position.x += pos.x;
            this.params.position.y += pos.y;
            this.params.position.z += pos.z;
        };

        Particle.prototype.setPosition = function(pos) {
            this.params.position.x = pos.x;
            this.params.position.y = pos.y;
            this.params.position.z = pos.z;
        };

        Particle.prototype.setQuaternion = function(quat) {
            this.params.quaternion.x = quat.x;
            this.params.quaternion.y = quat.y;
            this.params.quaternion.z = quat.z;
            this.params.quaternion.w = quat.w;
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
        };
                
        Particle.prototype.setAttribute1D = function(name, value) {
            this.buffers[name][this.attributes[name]] = value;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute2D = function(name, value1, value2) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute3D = function(name, value1, value2, value3) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
            this.attributeBuffers[name].needsUpdate = true;
        };

        Particle.prototype.setAttribute4D = function(name, value1, value2, value3, value4) {
            this.buffers[name][this.attributes[name]] = value1;
            this.buffers[name][this.attributes[name]+1] = value2;
            this.buffers[name][this.attributes[name]+2] = value3;
            this.buffers[name][this.attributes[name]+3] = value4;
            this.attributeBuffers[name].needsUpdate = true;
        };
                
        return Particle;

    });