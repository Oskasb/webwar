"use strict";


define([
    'PipelineAPI',
    'application/Settings',
    'Events',
    'ui/dom/DomUtils',
    'ui/GameScreen'
], function(
    PipelineAPI,
    Settings,
    evt,
    DomUtils,
    GameScreen
) {


    var GooRunner = goo.GooRunner;
    var Renderer = goo.Renderer;
    var Vector3 = goo.Vector3;
    var Texture = goo.Texture;
    var Vector = goo.Vector;
    
    
    var GooController = function() {
    //    this.cameraController = new GooCameraController();
    };

    GooController.prototype.setupGooRunner = function(clientTickCallback) {


        var g00 = new GooRunner({
        });



        this.goo = g00;
        g00.renderer.setClearColor(0.05, 0.0, 0.09, 0.21);

        g00.world.setSystem(new goo.AnimationSystem());

        document.getElementById('goo_window').appendChild(g00.renderer.domElement);
     //   g00.startGameLoop();

        var setupGooScene = function() {
        //    evt.fire(evt.list().ENGINE_READY, {goo:g00});
        };

        setupGooScene();

        var camEvt = {
            camTpf:0
        };
        
        
    //    this.registerGooUpdateCallback(clientTickCallback);
        //	this.cameraController.setCameraPosition(0, 0, 0);


    };
    
    GooController.prototype.registerGooUpdateCallback = function(callback) {
        this.goo.callbacksPreRender.push(callback);
        //	this.updateCallbacks.push(callback);
    };



    return GooController;

});