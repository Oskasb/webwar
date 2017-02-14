"use strict";

define([
        'gui/functions/CustomGraphCallbacks',
        'ui/canvas/CanvasDraw'
    ],
    function(
        CustomGraphCallbacks,
        CanvasDraw
    ) {

        var Vector3 = goo.Vector3;

        var rangeX;
        var rangeY;

        var centerX;
        var centerY;

        var calcVec = new Vector3(0, 0, 0);

        var CanvasInputVector = function() {

        };

        var tempRect = {
            left:0,
            top:0,
            width:0,
            height:0
        };

        var pos = {
            top: 0,
            left: 0
        };
        var size = {
            height:64,
            width: 64
        };


        CanvasInputVector.drawInputVectors = function(gamePiece, ctx, playerSpatial, confData, widgetConfigs) {

            calcVec.x = playerSpatial.posX();
            calcVec.y = playerSpatial.posY();
            calcVec.z = playerSpatial.posZ();

            pos = confData.pos;
            size = confData.size;


            ctx.strokeStyle = CanvasDraw.toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;


            centerX = CanvasDraw.vectorToX(calcVec, size);
            centerY = CanvasDraw.vectorToY(calcVec, size);



            var xMax = centerX+confData.zoom;
            var xMin = centerX-confData.zoom;
            var yMax = centerY+confData.zoom;
            var yMin = centerY-confData.zoom;


            rangeX = xMax - xMin;
            rangeY = yMax - yMin;



            var top  = CanvasDraw.vectorToCanvasX(calcVec, pos, size, centerX, rangeX);
            var left = CanvasDraw.vectorToCanvasY(calcVec, pos, size, centerY, rangeY);


            tempRect.left 	= left -1;
            tempRect.top 	= top -1;
            tempRect.width 	= 2;
            tempRect.height = 2;

            CanvasDraw.drawElementBorders(ctx, confData.elementBorder, size);

            var controls = gamePiece.piece.readServerModuleState('inputControls');

            for (var i = 0; i < controls.length; i++) {

        //        ctx.fillStyle = CanvasDraw.randomizedColor(widgetConfigs.inputRadial.thrColor, widgetConfigs.inputRadial.flicker);
                ctx.strokeStyle = CanvasDraw.randomizedColor(widgetConfigs.inputRadial.thrColor, widgetConfigs.inputRadial.flicker);

        //        ctx.font = widgetConfigs.inputRadial.font;
        //        ctx.textAlign = "center";

                ctx.lineWidth = widgetConfigs.serverRadial.width;
/*
                ctx.fillText(
                    'Thr:'+controls[i].value[1],
                     size.width * widgetConfigs.inputRadial.left,
                     size.height * widgetConfigs.inputRadial.top
                );
*/
                ctx.beginPath();
                CustomGraphCallbacks.addPointToGraph(ctx, size.width - 8 , size.height - 8);
                CustomGraphCallbacks.addPointToGraph(ctx, size.width - 8 , size.height - 12 - 35*controls[i].value[1]);
                ctx.stroke();

                ctx.strokeStyle = CanvasDraw.randomizedColor(widgetConfigs.serverRadial.color, widgetConfigs.serverRadial.flicker);

                var angle = MATH.TWO_PI / gamePiece.inputSegmentRadial.configs.radialSegments;
                var radius = widgetConfigs.serverRadial.range * (controls[i].value[1] + 1)* size.width / gamePiece.inputSegmentRadial.configs.distanceSegments;
                var addx = radius * Math.cos(angle*controls[i].value[0]  + 0.5*Math.PI);
                var addy = radius * Math.sin(angle*controls[i].value[0]  + 0.5*Math.PI);

                ctx.beginPath();
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
                ctx.stroke();


                CanvasDraw.drawControlVectorArc(ctx, tempRect,  -angle*controls[i].value[0]  -0.1, -angle*controls[i].value[0]  +0.1 , radius, widgetConfigs.serverRadial.color, widgetConfigs.serverRadial.width);


            }

            ctx.strokeStyle = CanvasDraw.randomizedColor(widgetConfigs.inputRadial.spatialColor, widgetConfigs.inputRadial.flicker);
            angle = -gamePiece.inputSegmentRadial.line.zrot + Math.PI;
            radius = Math.sqrt(5 * gamePiece.inputSegmentRadial.line.w);
            addx = radius * Math.sin(angle);
            addy = radius * Math.cos(angle);

            ctx.lineWidth = widgetConfigs.inputRadial.width;

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
            ctx.stroke();

            CanvasDraw.drawControlVectorArc(ctx, tempRect,  angle -0.1, angle +0.1 , radius, widgetConfigs.inputRadial.spatialColor, widgetConfigs.inputRadial.width);



        };


        return CanvasInputVector

    });

