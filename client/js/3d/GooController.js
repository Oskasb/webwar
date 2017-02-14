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
        
        
    //    this.registerGooUpdateCallback(clientTickCallback);
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



    return GooController;

});