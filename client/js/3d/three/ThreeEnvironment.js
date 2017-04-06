"use strict";


define(['../../PipelineObject',
    'Events'

], function(
    PipelineObject,
    evt
) {

    var envList = {};
    var skyList = {};

    var worldSetup = {};
    var world = {};
    var currentEnvId;

    var worldCenter = new THREE.Vector3(0, 0, 0);
    var calcVec = new THREE.Vector3();
    var calcVec2 = new THREE.Vector3();

    var theta;
    var phi;


    var sky;
    var scene;
    var camera;
    var renderer;
    var sunSphere;

    var currentSkyConf;

    var fogColor = new THREE.Color(1, 1, 1);
    var dynamicFogColor = new THREE.Color(1, 1, 1);
    var ambientColor = new THREE.Color(1, 1, 1);
    var dynamicAmbientColor = new THREE.Color(1, 1, 1);

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


    var initSky = function() {

        // Add Sky Mesh
        sky = new THREE.Sky();
        scene.add( sky.mesh );

        // Add Sun Helper
        sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 2000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );

        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
    //    scene.add( sunSphere );

    };


    function applySkyConfig() {

        var config = skyList[currentEnvId];

        var uniforms = sky.uniforms;
        uniforms.turbidity.value = config.turbidity.value;
        uniforms.rayleigh.value = config.rayleigh.value;
        uniforms.luminance.value = config.luminance.value;
        uniforms.mieCoefficient.value = config.mieCoefficient.value;
        uniforms.mieDirectionalG.value = config.mieDirectionalG.value;

        theta = Math.PI * ( config.inclination - 0.5 );
        phi = 2 * Math.PI * ( config.azimuth - 0.5 );

        sunSphere.position.x = config.distance * Math.cos( phi );
        sunSphere.position.y = config.distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = config.distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = true;

        sunSphere.lookAt(worldCenter)

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        //    renderer.render( scene, camera );

    }

    

    var updateDynamigFog = function(sunInTheBack) {

        dynamicFogColor.copy(fogColor);
        dynamicFogColor.lerp(world.sun.color, 0.2 - sunInTheBack * 0.2);
        dynamicFogColor.lerp(ambientColor, 0.3 - sunInTheBack * 0.3);
        world.fog.color.copy(dynamicFogColor)

    };


    var updateDynamigAmbient = function(sunInTheBack) {

        dynamicAmbientColor.copy(ambientColor);
        dynamicAmbientColor.lerp(world.fog.color, 0.2 + sunInTheBack * 0.2);
        //    dynamicAmbientColor.lerp(ambientColor, 0.2 - sunInTheBack * 0.2);
        world.ambient.color.copy(dynamicAmbientColor)

    };


    var tickEnvironment = function() {

        currentSkyConf = skyList[currentEnvId];

        theta = Math.PI * ( currentSkyConf.inclination - 0.5 );
        phi = 2 * Math.PI * ( currentSkyConf.azimuth - 0.5 );

        sunSphere.position.x = camera.position.x + currentSkyConf.distance * Math.cos( phi );
        sunSphere.position.y = camera.position.y + currentSkyConf.distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = camera.position.z + currentSkyConf.distance * Math.sin( phi ) * Math.cos( theta );


        sky.mesh.position.copy(camera.position);

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        world.sun.position.copy(sunSphere.position);
        world.sun.lookAt(camera.position);


        calcVec.x = 0;
        calcVec.y = 0;
        calcVec.z = 1;

        calcVec2.x = 0;
        calcVec2.y = 0;
        calcVec2.z = 1;

        calcVec.applyQuaternion(sunSphere.quaternion);
        calcVec2.applyQuaternion(camera.quaternion);

        calcVec.normalize();
        calcVec2.normalize();

        var sunInTheBack = calcVec.dot(calcVec2);

        updateDynamigFog(sunInTheBack);
        updateDynamigAmbient(sunInTheBack);
    };

    ThreeEnvironment.readDynamicValue = function(worldProperty, key) {
        return world[worldProperty][key];  
    };
    
    
    ThreeEnvironment.initEnvironment = function(store) {

        scene = store.scene;
        renderer = store.renderer;
        camera = store.camera;

        initSky();

        var createEnvWorld = function(worldSetup) {

            for (var key in world) {
                scene.remove(world[key]);
            }

            world = {};

            for (key in worldSetup) {

                if (key == "ambient") {

                    world[key] = new THREE.AmbientLight(0x000000);
                    scene.add(world[key]);
                    
                } else if (key == "fog") {
                    scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
                    world[key] = scene.fog;
                } else {
                    world[key] = new THREE.DirectionalLight(0x000000);
                    scene.add(world[key]);
                }
            }
        };

        var applyColor = function(Obj3d, color) {
            if (Obj3d) {
                Obj3d.color = new THREE.Color(color[0],color[1], color[2]);
            }

        };


        var applyFog = function(Obj3d, density) {
            Obj3d.density = density;
        };

        var applyEnvironment = function(envConfigs) {
            var config = envConfigs[currentEnvId];

            console.log(config, currentEnvId, envConfigs[currentEnvId]);

            for (var key in config) {


                if (config[key].color) {

                    if (key == 'sun') {

                        world[key].position.copy(sunSphere.position);
                        world[key].lookAt(worldCenter)
                    }

                    if (key == 'moon') {

                        world[key].position.x = 10 -sunSphere.position.x * 0.2;
                        world[key].position.y = 1000 +sunSphere.position.y * 5;
                        world[key].position.z = 10 -sunSphere.position.z * 0.2;
                        world[key].lookAt(worldCenter)
                    }


                    if (key == 'fog') {
                        fogColor.setRGB(config[key].color[0],config[key].color[1],config[key].color[2]);
                    }

                    if (key == 'ambient') {
                        ambientColor.setRGB(config[key].color[0],config[key].color[1],config[key].color[2]);
                    }

                    applyColor(world[key], config[key].color);
                }

                if (config[key].density) {
                    applyFog(world[key], config[key].density);
                    renderer.setClearColor(new THREE.Color(config[key].color[0],config[key].color[1], config[key].color[2]))
                }
            }
        };

        var environmentListLoaded = function(scr, data) {

            for (var i = 0; i < data.length; i++){

                envList[data[i].id] = {};
                skyList[data[i].id] = {};
                var configs = data[i].configs;

                skyList[data[i].id] = data[i].sky;

                for (var j = 0; j < configs.length; j++) {

                    envList[data[i].id][configs[j].id] = configs[j];
                }
            }

            applySkyConfig(skyList);
            applyEnvironment(envList);
        };

        createEnvWorld(worldSetup);

        new PipelineObject("ENVIRONMENT", "THREE", environmentListLoaded);

        evt.on(evt.list().CLIENT_TICK, tickEnvironment);

    };

    return ThreeEnvironment;

});