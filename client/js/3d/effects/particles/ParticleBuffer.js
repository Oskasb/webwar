

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

        var ParticleBuffer = function(rendererConfig, particleMaterial) {
            this.buildGeometry(rendererConfig, particleMaterial);
            this.time = 0;
        };



        ParticleBuffer.prototype.buildGeometry = function(rendererConfig, particleMaterial) {



            var geometry = new THREE.InstancedBufferGeometry();
            geometry.copy(new THREE.PlaneBufferGeometry(1, 1, 1, 1));

            var mesh;

            var particleCount = 5000;
            var translateArray = new Float32Array(particleCount * 3);
            
            for (var i = 0, i3 = 0, l = particleCount; i < l; i++, i3 += 3) {
                translateArray[i3 + 0] = Math.random() * 2 - 1;
                translateArray[i3 + 1] = Math.random() * 2 - 1;
                translateArray[i3 + 2] = Math.random() * 2 - 1;
            }

            this.attributes = {};
            this.attributes["translate"] = new THREE.InstancedBufferAttribute(translateArray, 3, 1)

            geometry.addAttribute("translate", this.attributes["translate"]);

             /*

            console.log("SETUP BUFFER SYSTEM",rendererConfig, particleMaterial);
            this.particles = 1000;

            var geometry = new THREE.InstancedBufferGeometry();
            geometry.copy(new THREE.PlaneBufferGeometry(1, 1, 1, 1));

            var translateArray = new Float32Array(this.particles * 3);
            var colors = new Float32Array( this.particles * 3 );
            var sizes = new Float32Array( this.particles );
            var color = new THREE.Color();


            for ( var i = 0, i3 = 0; i < this.particles; i ++, i3 += 3 ) {

                translateArray[i3 + 0] = Math.random() * 2 - 1;
                translateArray[i3 + 1] = Math.random() * 2 - 1;
                translateArray[i3 + 2] = Math.random() * 2 - 1;

                color.setHSL( i / this.particles, 1.0, 0.5 );
                colors[ i3 + 0 ] = color.r;
                colors[ i3 + 1 ] = color.g;
                colors[ i3 + 2 ] = color.b;
                sizes[ i ] = 20;
            }

            this.attributes = {};
            this.attributes["customColor"] = new THREE.InstancedBufferAttribute(colors, 3, 1);
            this.attributes["translate"] = new THREE.InstancedBufferAttribute(translateArray, 3, 1)
            this.attributes["size"] = new THREE.InstancedBufferAttribute(sizes, 1, 1);
            
        //    geometry.addAttribute( 'position',      this.attributes["position"] );
        //    geometry.addAttribute( 'customColor',   this.attributes["customColor"] );
            geometry.addAttribute( 'translate',     this.attributes["translate"] );
        //    geometry.addAttribute( 'size',          this.attributes["size"] );
            */
            this.geometry = geometry;

            var mesh = new THREE.Mesh(geometry, particleMaterial.material);
            mesh.scale.set(20, 20, 20);

            this.applyMesh(mesh);

            this.material = particleMaterial.material;

            return;

            for (var key in particleMaterial.attributes) {



                particleMaterial.attributes[key]._createBufferAttribute(particleCount);

                console.log(particleMaterial.attributes[key])

                this.attributes[key] = particleMaterial.attributes[key].bufferAttribute
                geometry.addAttribute(key, this.attributes[key]);

            };

            mesh = new THREE.Mesh(geometry, particleMaterial.material);
            mesh.scale.set(20, 20, 20);

            this.applyMesh(mesh);

            this.material = particleMaterial.material;

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
            /*
            for (var key in this.attributes) {
                var attrib = this.attributes[key];
                for (var i = 0; i < attrib.array.length; i++) {
                    attrib.array[i] = -0.5 + Math.random()*1;

                }
                attrib.needsUpdate = true
            }




        //    this.mesh.rotation.z = 0.01 * this.time;
            var translate = this.geometry.attributes.translate.array;

            for ( var i = 0; i < this.particles; i++ ) {

                translate[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + this.time ) );

            }
            this.geometry.attributes.translate.needsUpdate = true;
            */

            this.material.uniforms.time.value = this.time;
            this.mesh.rotation.x = this.time * 0.2;
            this.mesh.rotation.y = this.time * 0.4;

        };


        return ParticleBuffer;
        
    });