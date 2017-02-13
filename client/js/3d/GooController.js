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
    
    
    var GooController = function() {
        this.cameraController = new GooCameraController();
    };

    GooController.prototype.setupGooRunner = function(clientTickCallback) {
        
        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');;
        
        var downscale = PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');
        

        var g00 = new GooRunner({
            showStats:false,
            antialias:antialias,
            debug:false,
            manuallyStartGameLoop:true,
            tpfSmoothingCount:1,
            useTryCatch:false,
            logo:false,
            downScale:downscale
        });

        //	goo.renderer.downScale = downscale;

        var adjustPxScale = function(value) {
            console.log("Adjust Px Scale: ", value);
            g00.renderer.downScale = value;
        };

        Settings.addOnChangeCallback('display_pixel_scale', adjustPxScale);

        this.goo = g00;
        g00.renderer.setClearColor(0.05, 0.0, 0.09, 0.21);

        g00.world.setSystem(new goo.AnimationSystem());

        document.getElementById('goo_window').appendChild(g00.renderer.domElement);
        g00.startGameLoop();

        var setupGooScene = function() {
            evt.fire(evt.list().ENGINE_READY, {goo:g00});
        };

        setupGooScene();

        var camEvt = {
            camTpf:0
        };
        
        
        this.registerGooUpdateCallback(clientTickCallback);
        //	this.cameraController.setCameraPosition(0, 0, 0);

        var notifyRezize = function() {
            setTimeout(function() {
                g00.renderer.checkResize(g00.renderer.mainCamera);
            }, 10);

        };

        window.addEventListener('resize', notifyRezize);
        notifyRezize();
    };
    
    GooController.prototype.registerGooUpdateCallback = function(callback) {
        this.goo.callbacksPreRender.push(callback);
        //	this.updateCallbacks.push(callback);
    };


    var monkeypatchCustomEngine = function() {

        //	Vector = function(size) {
        //		this.data = new Float64Array(size);
        //	};
    //    DomUtils.addElementClass(document.getElementById('game_window'), 'game_window_landscape');

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

        evt.once(evt.list().PARTICLES_READY, handleResize);

        window.addEventListener('resize', handleResize);

        window.addEventListener('load', function() {
            handleResize()
        });
/*
        Renderer.prototype.checkResize = function (camera) {

            var devicePixelRatio = this.devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

            var adjustWidth = width * devicePixelRatio / this.downScale;
            var adjustHeight = height * devicePixelRatio / this.downScale;

            var fullWidth = adjustWidth;
            var fullHeight = adjustHeight;

            if (camera && camera.lockedRatio === true && camera.aspect) {
                adjustWidth = adjustHeight * camera.aspect;
            }

            var aspect = adjustWidth / adjustHeight;
            this.setSize(adjustWidth, adjustHeight, fullWidth, fullHeight);

            if (camera && camera.lockedRatio === false && camera.aspect !== aspect) {
                camera.aspect = aspect;
                if (camera.projectionMode === 0) {
                    camera.setFrustumPerspective();
                } else {
                    camera.setFrustum();
                }
                camera.onFrameChange();
            }
        };
*/
        setTimeout(function() {
            handleResize();
        }, 100);

    };

    monkeypatchCustomEngine();

    return GooController;

});