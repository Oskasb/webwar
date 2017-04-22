"use strict";

define([
        'gui/functions/CustomGraphCallbacks',
        'ui/canvas/CanvasDraw'
    ],
    function(
        CustomGraphCallbacks,
        CanvasDraw
    ) {


        var rangeX;
        var rangeY;

        var centerX;
        var centerY;
        
        var CanvasRadar = function() {

        };

        var tempRect = {
            left:0,
            top:0,
            width:0,
            height:0
        };

        var path = [];
        var wait = false;
        var zLine = zLine;


        var pos;
        var size;
        
        var startVec = {
            data: [0, 0]
        };

        var sizeVec = {
            data: [100, 100]
        };



        CanvasRadar.drawRadarContent = function(gamePieces, ctx, playerSpatial, confData, widgetConfigs) {

            pos = confData.pos;
            size = confData.size;

            ctx.strokeStyle = CanvasDraw.toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;
            
            var curveCount = 0;
            

            centerX = CanvasDraw.vectorToX(playerSpatial.pos, size);
            centerY = CanvasDraw.vectorToY(playerSpatial.pos, size);

            var pathPlotTO = setTimeout(function() {
                wait = false;
                zLine = true;
            }, 1500);

            var xMax = centerX+confData.zoom;
            var xMin = centerX-confData.zoom;
            var yMax = centerY+confData.zoom;
            var yMin = centerY-confData.zoom;


            rangeX = xMax - xMin;
            rangeY = yMax - yMin;
            var playerX = pos.top + size.height*0.5;
            var playerY = pos.left + size.width*0.5;

            tempRect.top 	= CanvasDraw.vectorToCanvasX(startVec, pos, size,  centerX, rangeX);

            tempRect.left 	= CanvasDraw.vectorToCanvasY(startVec, pos, size,  centerY, rangeY);


            tempRect.height = CanvasDraw.vectorToCanvasX(sizeVec, pos, size,   centerX, rangeX);

            tempRect.width  = CanvasDraw.vectorToCanvasY(sizeVec, pos, size,   centerY, rangeY);



        //    drawWorldBorders(ctx, tempRect, confData.worldSection, pos, size, startVec, sizeVec);
            
            CanvasDraw.drawWorldBorders(ctx, tempRect, confData.worldSection);
            CanvasDraw.drawElementBorders(ctx, confData.elementBorder, size);
            CanvasDraw.drawRaster(ctx, confData.raster, size);

            

            ctx.fillStyle = CanvasDraw.randomizedColor([0.5, 1, 0.4, 0.4], 0.2);
            
            var entCount = 0;
            for (var index in gamePieces) {
                entCount += 1;

                var spat = gamePieces[index].piece.spatial;
                var age = gamePieces[index].piece.temporal.getAge();

                var top  = CanvasDraw.vectorToCanvasX(spat.pos, pos, size, centerX, rangeX)-1;
                var left = CanvasDraw.vectorToCanvasY(spat.pos, pos, size, centerY, rangeY)-1;
                
                var seed = (Math.random()+1)*0.8;

            //    ctx.fillStyle = CanvasDraw.randomizedColor(widgetConfigs.playerBlips.colorSelf, 0.3);

                if (gamePieces[index].piece.type == 'sherman_tank') {
                    tempRect.left 	= left - widgetConfigs.playerBlips.size*seed;
                    tempRect.top 	= top - widgetConfigs.playerBlips.size*seed;
                    tempRect.width 	= 2*seed*widgetConfigs.playerBlips.size;
                    tempRect.height = 2*seed*widgetConfigs.playerBlips.size;



                    if (widgetConfigs.playerNames.on && !gamePieces[index].isOwnPlayer) {
              //          ctx.strokeStyle = toRgba(confData.playerNames.color);

                //        ctx.fillStyle = randomizedColor(widgetConfigs.playerNames.color, 0.3);

                        ctx.font = widgetConfigs.playerNames.font;
                        ctx.textAlign = "center";
                        ctx.fillText(
                            gamePieces[index].name,
                            tempRect.left,
                            tempRect.top - 4
                        );

                //        ctx.fillStyle = randomizedColor(widgetConfigs.playerBlips.colorOther, 0.3);

                    }
                    


                } else {
                    tempRect.left 	= left -1;
                    tempRect.top 	= top -1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;

                }

                ctx.fillRect(
                    tempRect.left ,
                    tempRect.top  ,
                    tempRect.width,
                    tempRect.height
                );

            }


        };


        return CanvasRadar

    });

