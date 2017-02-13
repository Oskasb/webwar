"use strict";


define([
        'Events',
        'ui/GooFpsGraph',
        'ui/GooTrafficGraph',
        'ui/lines/LineRenderSystem',
        'PipelineAPI'
    ],
    function(
        evt,
        GooFpsGraph,
        GooTrafficGraph,
        LineRenderSystem,
        PipelineAPI
    ) {


        var Vector3;
        
        var lineRenderSystem;
        var world;
        var cameraEntity;
        var gooFpsGraph;
        var gooTrafficGraph;

        var g00;
        var linerendering = false;

        var calcVec9;

        var calcVec;
        var calcVec2;
        var calcVec3;
        var calcVec4;

        var width = 10;
        var step = 0;
        var height = 3;
        var posLeft = -26;
        var posTop = 34;
        var padding = 0.3;


        var GooMonitor = function() {
            Vector3 = goo.Vector3;
            calcVec = new Vector3();
            calcVec2 = new Vector3();
            calcVec3 = new Vector3();
            calcVec4 = new Vector3();
        };


        function frameGraph() {

            calcVec.setDirect(posLeft-padding, posTop, 0);
            calcVec2.setDirect(posLeft+padding, posTop, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);

            calcVec.setDirect(posLeft, posTop-padding, 0);
            calcVec2.setDirect(posLeft, posTop+height+padding, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);

            calcVec.setDirect(posLeft-padding, posTop+height, 0);
            calcVec2.setDirect(posLeft+padding, posTop+height, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);
        }


        function drawGraph(dataArray, scale, color, offset, offsetY) {

            if (!offset) offset = 0;
            if (!offsetY) offsetY = 0;

            for (var i = 0; i < dataArray.length-1; i++) {
                step = width / dataArray.length;
                calcVec.setDirect(offsetY + posLeft+i*step, offset + posTop + dataArray[i][0]*height*scale, 0);
                calcVec2.setDirect(offsetY + posLeft+(i+1)*step, offset + posTop + dataArray[i+1][0]*height*scale, 0);
                screenSpaceLine(calcVec, calcVec2, lineRenderSystem[color]);
            }
        }

        function screenSpaceLine(from, to, color) {
            calcVec.setArray(from);
            calcVec2.setArray(to);

            calcVec.add(cameraEntity.transformComponent.transform.translation);
            calcVec2.add(cameraEntity.transformComponent.transform.translation);

            calcVec.z = 0;
            calcVec2.z = 0;

            lineRenderSystem.drawLine(calcVec, calcVec2, color);
        }

        function drawRelativeLine(e) {

            calcVec3.set(evt.args(e).from);
            calcVec4.set(evt.args(e).to);
            if (anchors[evt.args(e).anchor]) {
                applyAnchor(calcVec3, evt.args(e).anchor);
                applyAnchor(calcVec4, evt.args(e).anchor);
            };

            screenSpaceLine(calcVec3, calcVec4, lineRenderSystem[evt.args(e).color]);
        }

        function drawWorldBounds() {
            calcVec.setDirect(0, 0, 0);
            calcVec2.setDirect(100, 0, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.DARKPURP);

            calcVec.setDirect(100, 100, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.DARKPURP);

            calcVec2.setDirect(0, 100, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.DARKPURP);

            calcVec.setDirect(0, 0, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.DARKPURP);
        }

        var anchors = {
            bottom_right:[18, -18, 0],
            top_left:[-16, 16, 0],
            center:[0, 0, 0]
        };

        function applyAnchor(vec, anchorKey) {
            vec.x += anchors[anchorKey][0];
            vec.y += anchors[anchorKey][1];
            vec.z += anchors[anchorKey][2];
        }

        function drawRelativePosRad(e) {
            calcVec3.setDirect(evt.args(e).x, evt.args(e).y, 0);
            MATH.radialToVector(evt.args(e).angle, evt.args(e).distance, calcVec4);

            if (anchors[evt.args(e).anchor]) {
                applyAnchor(calcVec3, evt.args(e).anchor);
                applyAnchor(calcVec4, evt.args(e).anchor);
            }


            screenSpaceLine(calcVec3, calcVec4, lineRenderSystem[evt.args(e).color]);
        }


        function trackersEnable(DEBUG) {
            var trackFrames = DEBUG.graphPoints;


            gooFpsGraph.enableFpsTracker(trackFrames);
            gooTrafficGraph.enableTrafficTracker(trackFrames);


            var monServer = function(src, bool) {
                PipelineAPI.setCategoryData('STATUS', {SERVER_IDLE:gooTrafficGraph.getServerIdle()});
                PipelineAPI.setCategoryData('STATUS', {SERVER_BUSY:gooTrafficGraph.getServerBusy()});
                PipelineAPI.setCategoryData('STATUS', {SERVER_PIECES:gooTrafficGraph.getServerPieces()});
                PipelineAPI.setCategoryData('STATUS', {SERVER_PLAYERS:gooTrafficGraph.getServerPlayers()});
            };


            var monTraffic = function(src, bool) {
                PipelineAPI.setCategoryData('STATUS', {SEND_GRAPH:gooTrafficGraph.getSends()});
                PipelineAPI.setCategoryData('STATUS', {RECIEVE_GRAPH:gooTrafficGraph.getRecieves()});
            };

            var monTpf = function(src, bool) {
                PipelineAPI.setCategoryData('STATUS', {FPS_GRAPH:gooFpsGraph.progressBars});
            };


            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_SERVER', monServer);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_TRAFFIC', monTraffic);
            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_TPF', monTpf);


        }
        var pieces;



        var renderPiece = function(piece) {
            drawCross(piece.frameCurrentSpatial.pos, "RED");
            drawCross(piece.frameNextSpatial.pos, "CYAN");
            drawLine(piece.frameCurrentSpatial.pos, piece.spatial.pos, "RED");

            piece.frameCurrentSpatial.getForwardVector(calcVec9);
            calcVec9.scale(5);
            calcVec9.addVec(piece.frameCurrentSpatial.pos);

            drawLine(piece.frameCurrentSpatial.pos, calcVec9, "RED");

            drawLine(piece.spatial.pos, piece.frameNextSpatial.pos, "CYAN");

            piece.frameNextSpatial.getForwardVector(calcVec9);
            calcVec9.scale(5);
            calcVec9.addVec(piece.frameNextSpatial.pos);


            drawLine(piece.frameNextSpatial.pos, calcVec9, "CYAN");

            drawCross(piece.spatial.pos, "GREEN");

            piece.spatial.getForwardVector(calcVec9);
            calcVec9.scale(8);
            calcVec9.addVec(piece.spatial.pos);

            drawLine(piece.spatial.pos, calcVec9, "GREEN");


        };

        var clientTickPieceMonitor = function() {
            for (var key in pieces) {
                renderPiece(pieces[key].piece);
            }
        };

        var monitorSpatial = function(src, bool) {
            pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');

            if (bool) {
                evt.on(evt.list().CLIENT_TICK, clientTickPieceMonitor);
                enableLineRenderSys();
            } else {
                evt.removeListener(evt.list().CLIENT_TICK, clientTickPieceMonitor);
                diableLineRenderSys();
            }
        };





        function drawLine(from, to, color) {
            calcVec.setDirect(from.data[0], from.data[1], from.data[2]);
            calcVec2.setDirect(to.data[0], to.data[1], to.data[2]);
            
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem[color] || lineRenderSystem.WHITE);
        }

        function drawCross(vec3, color) {

            calcVec.setDirect(vec3.data[0], vec3.data[1], vec3.data[2]);
            lineRenderSystem.drawCross(vec3, lineRenderSystem[color] || lineRenderSystem.WHITE, 1);
        }

        function drawLineBetween(e) {
            enableLineRenderSys();
            drawLine(evt.args(e).from, evt.args(e).to, evt.args(e).color)
        }


        function drawPointAt(e) {
            enableLineRenderSys();
            drawCross(evt.args(e).pos, evt.args(e).color)
        }

        function enableLineRenderSys() {
            if (lineRenderSystem.passive == true) {
                lineRenderSystem.passive = false
            } else {
                if (linerendering) return;
                g00.setRenderSystem(lineRenderSystem);
            }
            linerendering = true;
        }

        function diableLineRenderSys() {
            if (!linerendering) return;
            linerendering = false;
            lineRenderSystem.passive = true;
        }

        function handleCameraReady(e) {
            //    return
            calcVec9 = new MATH.Vec3(0, 0, 0);
            g00 = evt.args(e).goo;
            world = evt.args(e).goo.world;
            cameraEntity = evt.args(e).camera;

            gooFpsGraph = new GooFpsGraph();
            gooTrafficGraph = new GooTrafficGraph();
            lineRenderSystem = new LineRenderSystem(world);

            function debugLoaded(key, setupData) {
                trackersEnable(setupData);
            }

            PipelineAPI.setCategoryData('GAME_DATA', {CAMERA:cameraEntity});
            PipelineAPI.subscribeToCategoryKey("setup", "DEBUG", debugLoaded);
            evt.fire(evt.list().MONITOR_STATUS, {CAMERA:'Cam'});

            evt.on(evt.list().DRAW_LINE_BETWEEN, drawLineBetween);
            evt.on(evt.list().DRAW_POINT_AT, drawPointAt);

            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_SPATIAL', monitorSpatial);
        }

        evt.fire(evt.list().MONITOR_STATUS, {CAMERA:'No Cam'});

        evt.once(evt.list().CAMERA_READY, handleCameraReady);

        return GooMonitor;

    });