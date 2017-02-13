"use strict";


define([
    'PipelineAPI',
    'application/Settings',
    'Events',
    '3d/GooCameraController',
    'ui/dom/DomUtils',
    'ui/GameScreen'
], function(
    PipelineAPI,
    Settings,
    evt,
    GooCameraController,
    DomUtils,
    GameScreen
) {


    var GooRunner = goo.GooRunner;
    var Renderer = goo.Renderer;
    var Vector3 = goo.Vector3;
    var Texture = goo.Texture;
    var Vector = goo.Vector;
    
    
    var ThreeController = function() {
    //    this.cameraController = new GooCameraController();
    };

    ThreeController.prototype.setupThreeRenderer = function(clientTickCallback) {
        
        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');;
        var downscale = PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');


        var scene, camera, renderer;
        var geometry, material, mesh;

        init();
        animate();

        function init() {

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 75, GameScreen.getAspect(), 1, 10000 );
            camera.position.z = 1000;

            geometry = new THREE.BoxGeometry( 200, 200, 200 );
            material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );

            renderer = new THREE.WebGLRenderer();
            GameScreen.getElement().appendChild(renderer.domElement);
            renderer.setSize( GameScreen.getWidth(), GameScreen.getHeight() );

         //   document.body.appendChild( renderer.domElement );

        }

        function animate() {

            requestAnimationFrame( animate );

            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.02;

            renderer.render( scene, camera );

        }

        

        var adjustPxScale = function(value) {
            console.log("Adjust Px Scale: ", value);
        };

        Settings.addOnChangeCallback('display_pixel_scale', adjustPxScale);
        

        var setupGooScene = function() {
    //        evt.fire(evt.list().ENGINE_READY, {goo:g00});
        };

        setupGooScene();
        

        var notifyRezize = function() {
            setTimeout(function() {
                renderer.setSize( GameScreen.getWidth(), GameScreen.getHeight() );
            }, 10);

        };

        window.addEventListener('resize', notifyRezize);
        notifyRezize();
    };

    var monkeypatchCustomEngine = function() {

        document.getElementById('game_window').style.left = '122em';
        document.getElementById('game_window').style.right = '122em';
        document.getElementById('game_window').style.top = '0em';
        document.getElementById('game_window').style.bottom = '0em';
        document.getElementById('game_window').style.width = 'auto';
        document.getElementById('game_window').style.height = 'auto';
        document.getElementById('game_window').style.position = 'fixed';

        var width = window.innerWidth;
        var height = window.innerHeight;
        var landscape = false;
        
        var handleResize = function() {
            width = window.innerWidth;
            height = window.innerHeight;
            

            if (width > height) {
                document.getElementById('game_window').style.left = '122em';
                document.getElementById('game_window').style.right = '122em';
                document.getElementById('game_window').style.top = '0em';
                document.getElementById('game_window').style.bottom = '0em';

                GameScreen.setLandscape(true);
                landscape = true;
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:true})
            } else {
                document.getElementById('game_window').style.left = '0em';
                document.getElementById('game_window').style.right = '0em';
                document.getElementById('game_window').style.top = '122em';
                document.getElementById('game_window').style.bottom = '122em';


                GameScreen.setLandscape(false);
                landscape = false;
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:false})
            }

            width = document.getElementById('game_window').offsetWidth;
            height = document.getElementById('game_window').offsetHeight;
            GameScreen.notifyResize();
            PipelineAPI.setCategoryData('SETUP', {SCREEN:[width, height], LANDSCAPE:landscape});
            
        };

        window.addEventListener('resize', handleResize);

        window.addEventListener('load', function() {
            handleResize()
        });

        setTimeout(function() {
            handleResize();
        }, 100);

    };

    monkeypatchCustomEngine();

    return ThreeController;

});