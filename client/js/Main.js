"use strict";

var SYSTEM_SETUP = {
    DEBUG:{
        on:false
    }
};

require.config({
    paths: {
        shared:'./../../../Transport',
        ThreeAPI:'./lib/three/ThreeAPI',
        PipelineAPI:'./lib/data_pipeline/src/PipelineAPI',
        gui:'./lib/canvas_gui/',
        particle_system:'./lib/particles',
        environment:'./lib/environment/src/',
        EnvironmentAPI:'./lib/environment/src/EnvironmentAPI',
        data_pipeline:'./lib/data_pipeline/src/'
    }
});

var meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "initial-scale=1, maximum-scale=1";
document.getElementsByTagName('head')[0].appendChild(meta);


Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

require([
    '3d/SceneController',
    'application/DataLoader',
    'application/DevConfigurator',
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
    SystemDetector,
    ButtonEventDispatcher,
    ControlStateDispatcher,
    Client,
    AnalyticsWrapper,
    GameScreen,
    PointerCursor
) {


    new SystemDetector();
    new ButtonEventDispatcher();
    new DevConfigurator();
    new ControlStateDispatcher();

    GameScreen.registerAppContainer(document.getElementById('game_window'));
    
    var sceneController = new SceneController();
    var dataLoader = new DataLoader();

    console.log(window.location.href);

    dataLoader.loadData(Client, PointerCursor, sceneController);

});
