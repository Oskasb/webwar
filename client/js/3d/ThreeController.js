"use strict";


define([
    'ThreeAPI',
    'PipelineAPI',
    'application/Settings',
    'Events',
    '3d/camera/ThreeCamera',
    'ui/GameScreen'
], function(
    ThreeAPI,
    PipelineAPI,
    Settings,
    evt,
    ThreeCamera,
    GameScreen
) {


    var ThreeController = function() {
        new ThreeCamera();
    };

    ThreeController.setupThreeRenderer = function(clientTickCallback, ready) {
        
        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');;
        var downscale = PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');

        ThreeAPI.initThreeScene(GameScreen.getElement(), clientTickCallback);

        var adjustPxScale = function(value) {
            console.log("Adjust Px Scale: ", value);
            downscale = value;
        };

        Settings.addOnChangeCallback('display_pixel_scale', adjustPxScale);

        var notifyRezize = function() {
            setTimeout(function() {
                ThreeAPI.updateWindowParameters(GameScreen.getWidth(), GameScreen.getHeight(), GameScreen.getAspect(), downscale);
                evt.fire(evt.list().ENGINE_READY, {});
            }, 10);
        };

    //    setTimeout(function() {
            ready()
    //    },20);
        
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