"use strict";


define(['Events',
    'PipelineAPI',
    '3d/camera/CameraFunctions',
    'ui/GameScreen'
], function(
    evt,
    PipelineAPI,
    CameraFunctions,
    GameScreen
) {

    var cameraFunctions;
    var cameraTarget;
    var orbitControl;

    var ThreeCamera = function() {

    };

    var setupThreeCamera = function(e) {

     //   cameraTarget = new THREE.Object3D();
     //   orbitControl = new THREE.OrbitControls(cameraTarget, GameScreen.getElement());

        evt.on(evt.list().CLIENT_TICK, updateCamera);
        
        cameraFunctions = new CameraFunctions();
    };
    
    var ownPiece;
    var tpf;

    var updateCamera = function(e) {
        if (!on) return;
        tpf = evt.args(e).tpf;
        ownPiece = PipelineAPI.readCachedConfigKey('GAME_DATA', 'OWN_PLAYER').ownPiece;
        cameraFunctions.setCameraTargetPiece(ownPiece);
        cameraFunctions.updateCamera(tpf);
    };

    evt.on(evt.list().ENGINE_READY, setupThreeCamera);

    var on = false;


    var controlledPieceUpdated = function(e) {
        on=true;
    };

    evt.once(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


    return ThreeCamera

});