"use strict";

define([
        'ThreeAPI'
    ],
    function(
        ThreeAPI
    ) {

        var effectFXAA;
        var bloomPass;
        var composer;
        var renderScene;

        var ScreenSpaceFX = function() {

        };

        ScreenSpaceFX.prototype.initFilterEffects = function() {

            renderScene = new THREE.RenderPass(ThreeAPI.getScene(), ThreeAPI.getCamera());

            effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
            effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

            var copyShader = new THREE.ShaderPass(THREE.CopyShader);
            copyShader.renderToScreen = true;

            bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);//1.0, 9, 0.5, 512);
            composer = new THREE.EffectComposer(ThreeAPI.getRenderer());
            composer.setSize(window.innerWidth, window.innerHeight);
            composer.addPass(renderScene);
            composer.addPass(effectFXAA);
            composer.addPass(bloomPass);
            composer.addPass(copyShader);
            //renderer.toneMapping = THREE.ReinhardToneMapping;
            ThreeAPI.getRenderer().gammaInput = true;
            ThreeAPI.getRenderer().gammaOutput = true;


                bloomPass.threshold = 0.2;
                bloomPass.exposure = 2;

                bloomPass.strength = 3;

                bloomPass.radius = 1.0;

        };
        
        return ScreenSpaceFX;

    });