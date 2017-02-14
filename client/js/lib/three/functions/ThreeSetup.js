"use strict";


define([], function(

) {
    
    var scene, camera, renderer;

    var prerenderCallbacks = [];
    var tpf, lastTime;
    var lookAt = new THREE.Vector3();

    var ThreeSetup = function() {

    };





    ThreeSetup.initThreeRenderer = function(containerElement, clientTickCallback) {
        prerenderCallbacks.push(clientTickCallback);
        lastTime = 0;
        init();
        animate(0.1);

        function init() {

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, containerElement.innerWidth / containerElement.innerHeight, 0.5, 10000 );
            camera.position.z = 1000;


            

            renderer = new THREE.WebGLRenderer();
            containerElement.appendChild(renderer.domElement);
        }

        function animate(time) {

            requestAnimationFrame( animate );
            tpf = (time - lastTime)*0.001;
            lastTime = time;

            for (var i = 0; i < prerenderCallbacks.length; i++) {
                prerenderCallbacks[i](tpf);
            }

            renderer.render(scene, camera);
        }
    };

    ThreeSetup.setCameraPosition = function(px, py, pz) {
        camera.position.x = px;
        camera.position.y = py;
        camera.position.z = pz;
    };

    ThreeSetup.setCameraLookAt = function(x, y, z) {
        lookAt.set(x, y, z);
        camera.up.set(0, 1, 0);
        camera.lookAt(lookAt);
    };

    ThreeSetup.addChildToParent = function(child, parent) {
        parent.add(child);
    };

    ThreeSetup.addModelToScene = function(model) {
        scene.add(model);
    };

    ThreeSetup.removeModelFromScene = function(model) {
        scene.remove(model);
    };

    ThreeSetup.setRenderParams = function(width, height, aspect, downscale) {
        renderer.setSize( width / downscale, height / downscale);
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
    };

    ThreeSetup.attachPrerenderCallback = function(callback) {
        if (prerenderCallbacks.indexOf(callback) != -1) {
            console.log("Callback already installed");
            return;
        }
        prerenderCallbacks.push(callback);
    };


    return ThreeSetup;

});