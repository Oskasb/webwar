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
    var pxRatio;

    var fireResize;

    var ThreeController = function() {
        new ThreeCamera();
    };

    ThreeController.setupThreeRenderer = function(clientTickCallback, ready) {


        pxRatio = window.devicePixelRatio;
        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');;
        pxRatio =  PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');

        ThreeAPI.initThreeScene(GameScreen.getElement(), clientTickCallback, pxRatio, antialias);

        var adjustPxScale = function(value) {
            console.log("Adjust Px Scale: ", value);
            pxRatio = value;
        };

        Settings.addOnChangeCallback('display_pixel_scale', adjustPxScale);


        setTimeout(function() {
            ready();
            evt.fire(evt.list().ENGINE_READY, {});

            setTimeout(function() {

                fireResize();
            }, 10)

        },20);

        window.addEventListener('resize', notifyRezize);
        monkeypatchCustomEngine();

    };

    var notifyRezize = function() {
        ThreeAPI.updateWindowParameters(GameScreen.getWidth(), GameScreen.getHeight(), GameScreen.getAspect(), pxRatio);
        setTimeout(function() {
    //        ThreeAPI.updateWindowParameters(GameScreen.getWidth(), GameScreen.getHeight(), GameScreen.getAspect(), pxRatio);
        }, 100);
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
        var timeout;

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

            PipelineAPI.setCategoryData('SETUP', {SCREEN:[width, height], LANDSCAPE:landscape});
            GameScreen.notifyResize();
            setTimeout(function() {
                GameScreen.notifyResize();
                notifyRezize();

            }, 1)


        };

        fireResize = function() {
         //   setTimeout(function() {
                handleResize();
         //   }, 1)

            clearTimeout(timeout, 1);
            timeout = setTimeout(function() {
                handleResize();
            }, 10)
        };

        window.addEventListener('resize', fireResize);

        window.addEventListener('load', function() {
            fireResize()
        });

        setTimeout(function() {
            fireResize();
        }, 100);

    };



    return ThreeController;

});