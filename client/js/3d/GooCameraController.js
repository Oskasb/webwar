"use strict";


define(['Events',
    'PipelineAPI',
    'EnvironmentAPI',
    '3d/camera/CameraFunctions'
], function(
    evt,
    PipelineAPI,
    EnvironmentAPI,
    CameraFunctions
    ) {

    var Camera = goo.Camera;
    var CameraComponen = goo.CameraComponent;
    var cameraFunctions;
    var EntityUtils = goo.EntityUtils;
    var Vector3 = goo.Vector3;
    var Matrix3x3 = goo.Matrix3x3;
    
    var camScript;
    var cameraEntity;
    var playerPiece;
    var g00;
    var camera;
    var forVec;
    var calcVec = new Vector3();
    var calcVec2 = new Vector3();

	var GooCameraController = function() {

	};



	GooCameraController.prototype.getCamera = function() {
		return camera;
	};

    GooCameraController.prototype.getCameraEntity = function() {
        return cameraEntity;
    };

    GooCameraController.prototype.setCameraPosition = function(x, y, z) {
        cameraEntity.transformComponent.transform.translation.setDirect(x, y, z);
        cameraEntity.transformComponent.setUpdated();
    };


    var cameraOffset = new Vector3(0, 0.82, 0);

    var cameras = {

    };


    var setupGooCamera = function(e) {
        g00 = evt.args(e).goo;

        camera = new Camera(45, 1, 0.25, 45000);
        cameraEntity = g00.world.createEntity('ViewCameraEntity');
        var cameraComponent = new goo.CameraComponent(camera);
        cameraEntity.setComponent(cameraComponent);
        cameraEntity.addToWorld();

        cameraEntity.transformComponent.transform.translation.setDirect(0, 10, 0);
        cameraEntity.transformComponent.setUpdated();

        evt.fire(evt.list().CAMERA_READY, {goo:g00, camera:cameraEntity});


        evt.on(evt.list().CLIENT_TICK, updateCamera);

        var camTick = function() {
            cameraEntity.transformComponent.updateTransform();
            cameraComponent.updateCamera(cameraEntity.transformComponent.transform);

        };
        
        
        evt.on(evt.list().CAMERA_TICK, camTick);
        cameraFunctions = new CameraFunctions();
    };


    var lastPos;
    var ownPiece;
    var tpf;

    var updateCamera = function(e) {
        if (!on) return;
        tpf = evt.args(e).tpf
        ownPiece = PipelineAPI.readCachedConfigKey('GAME_DATA', 'OWN_PLAYER').ownPiece;
        EnvironmentAPI.updateCameraFrame(tpf, cameraEntity);
        cameraFunctions.updateCamera(tpf,cameraEntity,ownPiece);
        cameraEntity.transformComponent.setUpdated();

	};

    evt.on(evt.list().ENGINE_READY, setupGooCamera);

    var on = false;


    var controlledPieceUpdated = function(e) {
        on=true;
    };

    evt.once(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


	return GooCameraController

});