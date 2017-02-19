"use strict";


define(['ui/GameScreen'], function(
    GameScreen
) {
    
    var scene, camera, renderer;

    var prerenderCallbacks = [];
    var tpf, lastTime;
    var lookAt = new THREE.Vector3();

    var ThreeSetup = function() {

    };





    ThreeSetup.initThreeRenderer = function(pxRatio, antialias, containerElement, clientTickCallback, store) {
        prerenderCallbacks.push(clientTickCallback);
        lastTime = 0;
        init();
        animate(0.1);

        function init() {

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, containerElement.innerWidth / containerElement.innerHeight, 0.5, 10000 );
            camera.position.z = 10;

            console.log("Three Camera:", camera);
            

            renderer = new THREE.WebGLRenderer( { antialias:antialias, devicePixelRatio: pxRatio });
            renderer.setPixelRatio( pxRatio );

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

        store.scene = scene;
        store.renderer = renderer;
        
        return store;
    };

    var vector = new THREE.Vector3();
    var tempObj = new THREE.Object3D();

    ThreeSetup.toScreenPosition = function(x, y, z, store) {

        tempObj.position.set(x, y, z);

        if (!frustum.containsPoint(tempObj.position)) {
            store.set(tempObj.position);
            return store;// Do something with the position...
        }

    //    var widthHalf = 0.5*renderer.context.canvas.width;
    //    var heightHalf = 0.5*renderer.context.canvas.height;

        tempObj.updateMatrixWorld();
        vector.setFromMatrixPosition(tempObj.matrixWorld);
        vector.project(camera);

    ////    vector.x = ( vector.x * widthHalf ) + widthHalf;
    ////    vector.y = - ( vector.y * heightHalf ) + heightHalf;

        store.x = vector.x * 0.5;
        store.y = vector.y * 0.5;
        store.z = 0;

    //    console.log(vector.x, width);
    //    store.x = vector.x * 0.05 + 0.05;
    //    store.y -= vector.y * 0.05 + 0.05;

        return store;

    };



    var frustum = new THREE.Frustum();
    var frustumMatrix = new THREE.Matrix4();


    ThreeSetup.sampleCameraFrustum = function(store) {

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
        camera.updateMatrix();
        camera.updateMatrixWorld();
        frustum.setFromMatrix(frustumMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        camera.needsUpdate = true;

    };

    ThreeSetup.addChildToParent = function(child, parent) {
        if (child.parent) {
            child.parent.remove(child);
        }
        parent.add(child);
    };

    ThreeSetup.addToScene = function(object3d) {
        scene.add(object3d);
        return object3d;
    };

    ThreeSetup.getCamera = function() {
        return camera;
    };

    ThreeSetup.removeModelFromScene = function(model) {
        if (model.parent) {
            model.parent.remove(model);
        }

        scene.remove(model);
    };

    ThreeSetup.setRenderParams = function(width, height, aspect, pxRatio) {
        renderer.setSize( width, height);
        renderer.setPixelRatio( pxRatio );
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