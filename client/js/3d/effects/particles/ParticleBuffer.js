

"use strict";

define([
        'ThreeAPI',
        '3d/effects/particles/ShaderAttribute',
        'PipelineObject'
    ],
    function(
        ThreeAPI,
        ShaderAttribute,
        PipelineObject
    ) {

        var ParticleBuffer = function(rendererConfig) {
            this.buildGeometry(rendererConfig);
            this.time = 0;
        };

        ParticleBuffer.prototype.buildGeometry = function(rendererConfig) {

            var geometry = new THREE.InstancedBufferGeometry();
            geometry.copy(new THREE.CircleBufferGeometry(1, 6));

            var mesh;

            var particleCount = 75000;
            var translateArray = new Float32Array(particleCount * 3);
            
            for (var i = 0, i3 = 0, l = particleCount; i < l; i++, i3 += 3) {
                translateArray[i3 + 0] = Math.random() * 2 - 1;
                translateArray[i3 + 1] = Math.random() * 2 - 1;
                translateArray[i3 + 2] = Math.random() * 2 - 1;
            }
            
            geometry.addAttribute("translate", new THREE.InstancedBufferAttribute(translateArray, 3, 1));


            var _this = this;

            var shaderReady = function(src, data) {
                console.log("SHADER READY", src, data);
                var material = new THREE.RawShaderMaterial({
                    uniforms: {
                        map: {value: new THREE.TextureLoader().load("./client/assets/images/effects/explosion.png")},
                        time: {value: 0.0}
                    },
                    vertexShader: data.vertex,
                    fragmentShader: data.fragment,
                    depthTest: true,
                    depthWrite: true
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.scale.set(500, 500, 500);
                _this.material = material;
                _this.applyMesh(mesh);
            };

            new PipelineObject("SHADERS", "INSTANCING_SHADER", shaderReady);
        };

        ParticleBuffer.prototype.applyMesh = function(mesh) {
            this.mesh = mesh;
        };

        ParticleBuffer.prototype.applyMaterial = function(material) {
                        
        };
        
        ParticleBuffer.prototype.addToScene = function() {
            ThreeAPI.addToScene(this.mesh);
        };


        ParticleBuffer.prototype.renderParticleBuffer = function(tpf) {

            this.time += tpf;
            this.material.uniforms.time.value = this.time;
            this.mesh.rotation.x = this.time * 0.2;
            this.mesh.rotation.y = this.time * 0.4;

        };
        
        

        return ParticleBuffer;
        
        
    });