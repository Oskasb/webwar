"use strict";

define([
        'gui/functions/CustomGraphCallbacks',
        'ui/canvas/CanvasDraw'
    ],
    function(
        CustomGraphCallbacks,
        CanvasDraw
    ) {

        var Vector3 = THREE.Vector3;
        var rangeX;
        var rangeY;

        var centerX;
        var centerY;

        var calcVec = new Vector3(0, 0, 0);

        var CanvasTemporalState = function() {

        };

        var tempRect = {
            left:0,
            top:0,
            width:0,
            height:0
        };

        var tmpColor = [0, 0, 0, 0];

        CanvasTemporalState.drawTemporal = function(gamePiece, ctx, playerSpatial, confData, widgetConfigs) {

            calcVec.x = playerSpatial.posX();
            calcVec.y = playerSpatial.posY();
            calcVec.z = playerSpatial.posZ();
            
            var pos = confData.pos;
            var size = confData.size;


            ctx.strokeStyle = CanvasDraw.toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

            CanvasDraw.drawRaster(ctx, confData.raster, size);



            centerX = CanvasDraw.vectorToX(calcVec, size);
            centerY = CanvasDraw.vectorToY(calcVec, size);



            var xMax = centerX+confData.zoom;
            var xMin = centerX-confData.zoom;
            var yMax = centerY+confData.zoom;
            var yMin = centerY-confData.zoom;


            rangeX = xMax - xMin;
            rangeY = yMax - yMin;

            

                var tmp = gamePiece.piece.temporal

                
                var idealTimeSlice = tmp.getIdealTimeSlice();
                var timeProgress = tmp.getPacketTimeFraction();
                var totalTime = tmp.getAge();
                var overdue = tmp.getOverdue();

            var top  = CanvasDraw.vectorToCanvasX(calcVec, pos, size, centerX, rangeX);
            var left = CanvasDraw.vectorToCanvasY(calcVec, pos, size, centerY, rangeY);


                    tempRect.left 	= left -1;
                    tempRect.top 	= size.height +1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;

                        var controls = gamePiece.piece.readServerModuleState('inputControls');

                        for (var i = 0; i < controls.length; i++) {


                            var green = 0;
                            if (timeProgress > idealTimeSlice) {
                                green =1;
                            }


                            tmpColor[0] = overdue + 0.2*green; // confData.serverRadial.timeColor[0];
                            tmpColor[1] = widgetConfigs.serverRadial.timeColor[1] * (1-overdue);
                            tmpColor[2] = widgetConfigs.serverRadial.timeColor[2] * (0.5-overdue); // * 1/(1+timeProgress);
                            tmpColor[3] = widgetConfigs.serverRadial.timeColor[3];


                            var timeAngle = - Math.PI * 0.5 + (timeProgress) * MATH.TWO_PI;

                            var timeAngle = - Math.PI * 0.5 + (totalTime) * MATH.TWO_PI;

                            timeAngle = 0.5*Math.sin(timeAngle) - Math.PI * 0.5;

                            var radius = widgetConfigs.serverRadial.clockRadius ;

                            var w = widgetConfigs.serverRadial.timeWidth; // - widgetConfigs.serverRadial.timeWidth*(timeProgress*timeProgress);

                            w += overdue*radius*0.05;

                            CanvasDraw.drawControlVectorArc(ctx, tempRect,  timeAngle, timeAngle + widgetConfigs.serverRadial.timeSize * idealTimeSlice, radius, tmpColor, w);


                        }
            tmpColor[0] = 0.6*timeProgress;
            tmpColor[1] = 0.1*timeProgress;
            tmpColor[2] = 1-timeProgress;
            tmpColor[3] *= (1-timeProgress);
            ctx.strokeStyle = CanvasDraw.randomizedColor(tmpColor, widgetConfigs.serverRadial.flicker);

            ctx.lineWidth = widgetConfigs.inputRadial.width;

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, - 2 + (size.width-2) * (1-timeProgress) ,  size.height - 4 );
            CustomGraphCallbacks.addPointToGraph(ctx, 2 + (size.width-2) * timeProgress, size.height - 4);
            ctx.stroke();

            


        };


        return CanvasTemporalState

    });

