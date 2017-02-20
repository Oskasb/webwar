"use strict";


define(['../../PipelineObject'

], function(
    PipelineObject
) {

    var envList = {};
    var worldSetup = {};
    var world = {};
    var currentEnvId;
    var envData = {};

    var scene;
    var renderer;

    var ThreeEnvironment = function() {

    };

    ThreeEnvironment.loadEnvironmentData = function() {

        var worldListLoaded = function(scr, data) {
            for (var i = 0; i < data.params.length; i++){
                worldSetup[data.params[i].id] = data.params[i]
            }
            currentEnvId = data.defaultEnvId;
        };
        new PipelineObject("WORLD", "THREE", worldListLoaded);
    };

    
    ThreeEnvironment.initEnvironment = function(store) {

        scene = store.scene;
        renderer = store.renderer;

        var createEnvWorld = function(worldSetup) {

            for (var key in world) {
                scene.remove(world[key]);
            }

            world = {};

            for (key in worldSetup) {

                if (key == "skybox") {

                 //   var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
                 //   var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
                 //   var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
//
                 //   world[key] = skyBox;
                 //   scene.add(world[key]);


                } else if (key == "fog") {
                    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
                    world[key] = scene.fog;
                } else {
                    world[key] = new THREE.DirectionalLight(0xffffff);
                    scene.add(world[key]);
                }
            }
        };

        var applyColor = function(Obj3d, color) {
            if (Obj3d) {
                Obj3d.color = new THREE.Color(color[0],color[1], color[2]);
            }

        };

        var applyTransform = function(Obj3d, trx) {
//
            if (trx.pos) {
                Obj3d.position.x = trx.rot[0];
                Obj3d.position.y = trx.rot[1];
                Obj3d.position.z = trx.rot[2];
            }
            if (trx.rot) {
                Obj3d.rotation.x = trx.rot[0];
                Obj3d.rotation.y = trx.rot[1];
                Obj3d.rotation.z = trx.rot[2];
            }
        };

        var applyFog = function(Obj3d, density) {
            Obj3d.density = density;
        };

        var applyEnvironment = function(envConfigs) {
            var config = envConfigs[currentEnvId];

            console.log(config, currentEnvId, envConfigs[currentEnvId]);

            console.log(config);

            for (var key in config) {

                if (config[key].transform) {
                    applyTransform(world[key], config[key].transform);
                }

                if (config[key].color) {
                    applyColor(world[key], config[key].color);
                }

                if (config[key].density) {
                    applyFog(world[key], config[key].density);
                    renderer.setClearColor(new THREE.Color(config[key].color[0],config[key].color[1], config[key].color[2]))
                }
            }
        };

        var environmentListLoaded = function(scr, data) {
            envData = {};

            for (var i = 0; i < data.length; i++){

                var env = {}
                envList[data[i].id] = env;
                envData[data[i].id] = {};
                var configs = data[i].configs;
                for (var j = 0; j < configs.length; j++) {

                    envData[data[i].id][configs[j].id] = {};


                    envList[data[i].id][configs[j].id] = configs[j];
                }
            }
            applyEnvironment(envList)
        };

        createEnvWorld(worldSetup);

        new PipelineObject("ENVIRONMENT", "THREE", environmentListLoaded);
    };

    return ThreeEnvironment;

});