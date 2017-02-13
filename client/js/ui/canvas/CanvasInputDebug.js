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

        var CanvasInputDebug = function() {

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


        CanvasInputDebug.drawInputVectors = function(gamePiece, ctx, camera, confData, widgetConfigs) {

            calcVec.set(camera.transformComponent.transform.translation);
            
            pos = confData.pos;
            size = confData.size;


            CanvasDraw.drawRadialRaster(ctx, confData.raster, size);

            ctx.strokeStyle = CanvasDraw.toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

            CanvasDraw.drawElementBorders(ctx, confData.elementBorder, size);

            var curveCount = 0;
                        
            centerX = CanvasDraw.vectorToX(calcVec, size);
            centerY = CanvasDraw.vectorToY(calcVec, size);



            var xMax = centerX+confData.zoom;
            var xMin = centerX-confData.zoom;
            var yMax = centerY+confData.zoom;
            var yMin = centerY-confData.zoom;

            rangeX = xMax - xMin;
            rangeY = yMax - yMin;

            var playerX = pos.top + size.height*0.5;
            var playerY = pos.left + size.width*0.5;


            
            var entCount = 0;

                entCount += 1;

                var tmp = gamePiece.piece.temporal
                
                var spat = gamePiece.piece.spatial;
                var target = gamePiece.piece.frameCurrentSpatial;
                var extrap = gamePiece.piece.frameNextSpatial;


            var top  = CanvasDraw.vectorToCanvasX(calcVec, pos, size, centerX, rangeX);
            var left = CanvasDraw.vectorToCanvasY(calcVec, pos, size, centerY, rangeY);


                    tempRect.left 	= left -1;
                    tempRect.top 	= top -1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;
            

                    //    if (data.color) ctx.strokeStyle = toRgba(data.color);
                        var angle = gamePiece.inputSegmentRadial.line.zrot;

                        var radius = widgetConfigs.inputRadial.range * gamePiece.inputSegmentRadial.line.w * size.width * 0.01;

                        tempRect.top 	= CanvasDraw.vectorToCanvasX(spat.pos, pos, size, centerX, rangeX);
                        tempRect.left   = CanvasDraw.vectorToCanvasY(spat.pos, pos, size, centerY, rangeY);


                        angle = spat.yaw()+Math.PI*0.5;


            CanvasDraw.plotRotationState(ctx, tempRect, angle, spat.yawVel(), Math.sqrt(radius*20)*1.4, widgetConfigs.inputRadial.spatialColor, widgetConfigs.inputRadial.spatialWidth);

                        ctx.fillStyle = CanvasDraw.toRgba(widgetConfigs.inputRadial.spatialColor);

                        ctx.fillRect(
                            tempRect.left-2,
                            tempRect.top-2,
                            tempRect.height*2,
                            tempRect.width*2
                        );


                        tempRect.top 	= CanvasDraw.vectorToCanvasX(target.pos, pos, size, centerX, rangeX);
                        tempRect.left 	= CanvasDraw.vectorToCanvasY(target.pos, pos, size, centerY, rangeY);


                        angle = target.rot.data[0]+Math.PI*0.5;;

            CanvasDraw.plotRotationState(ctx, tempRect, angle, target.yawVel(), Math.sqrt(radius*20) * 1.2, widgetConfigs.inputRadial.targetColor, widgetConfigs.inputRadial.targetWidth);
                        ctx.fillStyle = CanvasDraw.toRgba(widgetConfigs.inputRadial.targetColor);

                        ctx.fillRect(
                            tempRect.left-2,
                            tempRect.top-2,
                            tempRect.height*2,
                            tempRect.width*2
                        );


                        tempRect.top 	= CanvasDraw.vectorToCanvasX(extrap.pos, pos, size, centerX, rangeX);
                        tempRect.left 	= CanvasDraw.vectorToCanvasY(extrap.pos, pos, size, centerY, rangeY);

                        angle = extrap.yaw()+Math.PI*0.5;

            CanvasDraw.plotRotationState(ctx, tempRect, angle, target.yawVel(), Math.sqrt(radius*20) * 1.0, widgetConfigs.inputRadial.extrapColor, widgetConfigs.inputRadial.targetWidth);
                        ctx.fillStyle = CanvasDraw.toRgba(widgetConfigs.inputRadial.extrapColor);

                        ctx.fillRect(
                            tempRect.left-2,
                            tempRect.top-2,
                            tempRect.height*2,
                            tempRect.width*2
                        );




        };


        return CanvasInputDebug

    });

