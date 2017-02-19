"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasRadar',
        'ui/canvas/CanvasInputVector',
        'ui/canvas/CanvasInputDebug',
        'ui/canvas/CanvasTemporalState',
        'ui/canvas/CanvasGraph',
        'ui/canvas/CanvasDraw'
    ],
    function(
        evt,
        PipelineAPI,
        GameScreen,
        CanvasRadar,
        CanvasInputVector,
        CanvasInputDebug,
        CanvasTemporalState,
        CanvasGraph,
        CanvasDraw
    ) {

        var pieces;
        var camera;
        var ownPiece;
        var widgetConfigs;
        var selectedTarget;
        var pointerFrustumPos = new goo.Vector3();

        var CanvasFunctions = function(canvasGuiApi) {

            this.canvasGuiApi = canvasGuiApi;
            this.configs = {};

            pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
        //    camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA');
            
            var setOwnPiece = function(src, data) {
                ownPiece = data.ownPiece;
            };

            var canvasWidgets = function(src, data) {
                widgetConfigs = data;
            };
            
            PipelineAPI.subscribeToCategoryKey('GAME_DATA', 'OWN_PLAYER', setOwnPiece);
            PipelineAPI.subscribeToCategoryKey('canvas', 'widgets', canvasWidgets);
        };


        CanvasFunctions.prototype.setupCallbacks = function(id, conf, callbackNames) {

            this.callbacks = [];

            var configs = conf;
            
            var radarCallback = function(tpf, ctx) {
                CanvasRadar.drawRadarContent(pieces, ctx, ownPiece.piece.spatial, configs, widgetConfigs);
            };

            var temporalStateCallback = function(tpf, ctx) {
                if (ownPiece) {
                    CanvasTemporalState.drawTemporal(ownPiece, ctx, ownPiece.piece.spatial, configs, widgetConfigs);
                }
            };

            var inputVectorCallback = function(tpf, ctx) {
                if (ownPiece) {
                    CanvasInputVector.drawInputVectors(ownPiece, ctx, ownPiece.piece.spatial, configs, widgetConfigs);
                    CanvasDraw.drawPitchAndRollState(ownPiece, ctx, configs, widgetConfigs);
                }
            };

            var inputDebugCallback = function(tpf, ctx) {
                if (ownPiece) {
                    CanvasInputDebug.drawInputVectors(ownPiece, ctx, ownPiece.piece.spatial, configs, widgetConfigs);
                    CanvasInputDebug.drawInputVectors(ownPiece, ctx, ownPiece.piece.spatial, configs, widgetConfigs);
                }
            };
            
            var tpfMonitorCallback = function(tpf, ctx) {

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_SERVER')) {
                    
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_IDLE'), ctx, widgetConfigs.idleGraph, widgetConfigs.idleGraph.topValue);
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_BUSY'), ctx, widgetConfigs.busyGraph, widgetConfigs.busyGraph.topValue);
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_PIECES'), ctx, widgetConfigs.piecesGraph, widgetConfigs.piecesGraph.topValue);
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_PLAYERS'), ctx, widgetConfigs.playersGraph, widgetConfigs.playersGraph.topValue);
                }

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TRAFFIC')) {
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SEND_GRAPH'), ctx, widgetConfigs.sendGraph, widgetConfigs.sendGraph.topValue);
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'RECIEVE_GRAPH'), ctx, widgetConfigs.recieveGraph, widgetConfigs.recieveGraph.topValue);
                }


                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TPF')) {
                    CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'FPS_GRAPH'), ctx, widgetConfigs.tpfGraph, 1/widgetConfigs.tpfGraph.topValue);
                }
            };

            var canvasGuiApi = this.canvasGuiApi;
            var mouseState;



            var followPointerCallback = function(tpf, ctx) {
                mouseState = PipelineAPI.readCachedConfigKey('POINTER_STATE', 'mouseState');
                
                if (mouseState.action[0]) {

                    if (!canvasGuiApi.enabled) {
                        canvasGuiApi.toggleGuiEnabled(true);
                    }

                    CanvasDraw.drawElementBorders(ctx, configs.elementBorder, configs.size);

                    pointerFrustumPos.setDirect(
                        ((mouseState.x-GameScreen.getLeft()) / GameScreen.getWidth() - 0.5),
                        -((mouseState.y-GameScreen.getTop()) / GameScreen.getHeight()) + 0.5,
                        0
                    );

                    fitView(pointerFrustumPos);

                    canvasGuiApi.setElementPosition(

                        pointerFrustumPos.x,
                        pointerFrustumPos.y

                    )

                } else {
                    canvasGuiApi.toggleGuiEnabled(false);
                }
            };


            var fitView = function(vec3) {
                vec3.x *= 0.84 * GameScreen.getAspect();
                vec3.v *= -0.84
                vec3.z = 0;
            };

            var distsq;

            var checkPieceForSelectable = function(piece) {

                for (var i = 0; i < piece.pieceData.attachment_points.length; i++) {
                    if (piece.pieceData.attachment_points[i].slot == 'hull') {
                        return true;
                    };
                }

            };
            
            var checkPieceForHover = function(piece) {
                
                if (!checkPieceForSelectable(piece)) {
                    return;
                }
                
                if (piece === ownPiece) {
                     return;
                }

                piece.getScreenPosition(frustumCoordinates);
                
                fitView(frustumCoordinates);

                distsq = goo.Vector3.distanceSquared(frustumCoordinates, pointerFrustumPos);

                if (pointerDistance > distsq) {
                    hoverCoords.setVector(frustumCoordinates);
                    pointerDistance = distsq;
                    hoverPiece = piece;
                }

            };


            var hoverPiece;
            var frustumCoordinates = new goo.Vector3(0, 0, 0);
            var hoverCoords = new goo.Vector3(0, 0, 0);
            var pointerDistance;

            var selectRange = 0.025;

            var hoverTargetsCallback = function(tpf, ctx) {

                mouseState = PipelineAPI.readCachedConfigKey('POINTER_STATE', 'mouseState');
                pointerDistance = selectRange;
                if (mouseState.action[0]) {
                    hoverPiece = null;

                    borderData = configs.hoverBorder;

                    for (var key in pieces) {
                        checkPieceForHover(pieces[key]);
                    }



                    if (pointerDistance != selectRange) {

                        if (!canvasGuiApi.enabled) {
                            canvasGuiApi.toggleGuiEnabled(true);
                        }

                        canvasGuiApi.setElementPosition(
                            hoverCoords.x,
                            hoverCoords.y
                        );

                        if (PipelineAPI.readCachedConfigKey("CONTROL_STATE","TOGGLE_TARGET_SELECTED") == hoverPiece.playerId) {
                            borderData = configs.triggerBorder;
                        }

                        PipelineAPI.setCategoryKeyValue('GAME_DATA', 'CURRENT_HOVER', hoverPiece);



                    } else if (canvasGuiApi.enabled) {
                        hoverPiece = null;
                        selectedTarget = hoverPiece;

                        canvasGuiApi.toggleGuiEnabled(false);

                        PipelineAPI.setCategoryKeyValue('GAME_DATA', 'CURRENT_HOVER', null);
                    } else {

                    }

                    CanvasDraw.drawElementBorders(ctx, borderData, configs.size);

                } else if (canvasGuiApi.enabled) {

                    selectedTarget = hoverPiece;

                    if (selectedTarget) {
                        if (PipelineAPI.readCachedConfigKey("CONTROL_STATE","TOGGLE_TARGET_SELECTED") == selectedTarget.playerId) {

                            PipelineAPI.setCategoryKeyValue('CONTROL_STATE', 'TOGGLE_ATTACK_ENABLED', true);
                        } else {
                            PipelineAPI.setCategoryKeyValue("CONTROL_STATE","TOGGLE_TARGET_SELECTED", selectedTarget.playerId);

                            PipelineAPI.setCategoryKeyValue('CONTROL_STATE', 'TOGGLE_ATTACK_ENABLED', false);

                        }

                    } else {
                        PipelineAPI.setCategoryKeyValue("CONTROL_STATE","TOGGLE_TARGET_SELECTED", null);
                        PipelineAPI.setCategoryKeyValue('CONTROL_STATE', 'TOGGLE_ATTACK_ENABLED', false);

                    }

                //    "event":{"category":"CONTROL_STATE", "key":"TOGGLE_TARGET_SELECTED", "type":"toggle"}
                    
                    canvasGuiApi.toggleGuiEnabled(false);
                    PipelineAPI.setCategoryKeyValue('GAME_DATA', 'CURRENT_HOVER', null);
                } else {

                }
            };

            var borderData;
            var currentTargetCallback = function(tpf, ctx) {

                if (selectedTarget && pieces[selectedTarget.piece.id]) {
                    PipelineAPI.setCategoryKeyValue("CONTROL_STATE","TOGGLE_TARGET_DESLECTED", selectedTarget.piece.id);
                    if (PipelineAPI.readCachedConfigKey("CONTROL_STATE","TOGGLE_ATTACK_ENABLED") == true) {
                        borderData = configs.attackBorder
                    } else {
                        borderData = configs.selectedBorder
                    }
                    CanvasDraw.drawElementBorders(ctx, borderData, configs.size);

                    var yawAim = ownPiece.piece.readServerModuleState('turret_aim_yaw')[0].value;
                //    console.log(yawAim)
                    CanvasDraw.drawTargettingYaw(ctx, borderData, configs.size, Math.abs(yawAim));

                    var pitchAim = ownPiece.piece.readServerModuleState('turret_aim_pitch')[0].value;
                    //    console.log(yawAim)
                    CanvasDraw.drawTargettingPitch(ctx, borderData, configs.size, Math.abs(pitchAim));
                    
                    if (!canvasGuiApi.enabled) {
                        canvasGuiApi.toggleGuiEnabled(true);
                    }

                    selectedTarget.getScreenPosition(frustumCoordinates);
                    fitView(frustumCoordinates);

                    canvasGuiApi.setElementPosition(
                        frustumCoordinates.x,
                        frustumCoordinates.y
                    );

                } else if (canvasGuiApi.enabled) {
                    CanvasDraw.clearElement(ctx, configs.size);
                    canvasGuiApi.toggleGuiEnabled(false);

                    PipelineAPI.setCategoryKeyValue("CONTROL_STATE","TOGGLE_TARGET_DESLECTED", "no_more_targets_here");

                }

            };
            
            

            var canvasCallbacks = {
                radarMap:radarCallback,
                inputVector:inputVectorCallback,
                inputDebug:inputDebugCallback,
                temporalState:temporalStateCallback,
                tpfMonitor:tpfMonitorCallback,
                followPointer:followPointerCallback,
                hoverTargets:hoverTargetsCallback,
                currentTarget:currentTargetCallback
            };

            for (var i = 0; i < callbackNames.length; i++) {
                this.callbacks.push(canvasCallbacks[callbackNames[i]])
            }

        };

        CanvasFunctions.prototype.callCallbacks = function(tpf, ctx) {
            for (var i = 0; i < this.callbacks.length; i++) {
                this.callbacks[i](tpf, ctx);
            }
        };
        

        return CanvasFunctions;

    });


