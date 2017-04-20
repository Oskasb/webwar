"use strict";



require([
    '3d/SceneController',
    'application/DataLoader',
    'application/DevConfigurator',
    'application/FullScreenConfigurator',
    'application/SystemDetector',
    'application/ButtonEventDispatcher',
    'application/ControlStateDispatcher',
    'application/Client',
    'application/AnalyticsWrapper',
    'ui/GameScreen',
    'io/PointerCursor'
], function(
    SceneController,
    DataLoader,
    DevConfigurator,
    FullScreenConfigurator,
    SystemDetector,
    ButtonEventDispatcher,
    ControlStateDispatcher,
    Client,
    AnalyticsWrapper,
    GameScreen,
    PointerCursor
) {


    var init = function() {
        new SystemDetector();
        new ButtonEventDispatcher();
        new DevConfigurator();
        new FullScreenConfigurator();
        new ControlStateDispatcher();

        GameScreen.registerAppContainer(document.getElementById('canvas_window'));

        var sceneController = new SceneController();
        var dataLoader = new DataLoader();

        console.log(window.location.href);

        dataLoader.loadData(Client, PointerCursor, sceneController);
    };

    setTimeout(function() {
        init();
    }, 0)

});
