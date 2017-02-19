"use strict";

define([
        'gui/functions/CustomGraphCallbacks'
    ],
    function(
        CustomGraphCallbacks
    ) {

        var path = [];
        
        var CanvasDraw = function() {

        };

        var rgbaData = [0, 0, 0, 0];

        CanvasDraw.toRgba = function(color) {
            rgbaData[0] = Math.floor(color[0]*255);
            rgbaData[1] = Math.floor(color[1]*255);
            rgbaData[2] = Math.floor(color[2]*255);
            rgbaData[3] = color[3];
            return 'rgba('+rgbaData+')';
        };

        CanvasDraw.vectorToX = function(vec, size) {

            if (vec.z) {
                return size.height - vec.z * size.height*0.01;
            } else {
                return size.height - vec.data[2] * size.height*0.01;
            }
        };

        CanvasDraw.vectorToY = function(vec, size) {

            if (vec.x) {
                return size.width - vec.x * size.width*0.01;
            } else {
                return size.width - vec.data[0] * size.width*0.01;
            }
        };

        CanvasDraw.vectorToCanvasX = function(vec, pos, size, centerX, rangeX) {
            return (((CanvasDraw.vectorToX(vec, size) - centerX)*size.width/rangeX)  +  pos.left  + size.width* 0.5) ;
        };

        CanvasDraw.vectorToCanvasY = function(vec, pos, size, centerY, rangeY) {
            return (((CanvasDraw.vectorToY(vec, size) - centerY)*size.height/rangeY)  +  pos.top + size.height * 0.5);
        };

        CanvasDraw.randomizedColor = function(color, flicker) {
            return CanvasDraw.toRgba([
                color[0]*(1-flicker + Math.random()*flicker),
                color[1]*(1-flicker + Math.random()*flicker),
                color[2]*(1-flicker + Math.random()*flicker),
                color[3]*(1-flicker + Math.random()*flicker)
            ]);
        };


        CanvasDraw.drawWorldBorders = function(ctx, tempRect, worldSection) {

            if (Math.random() < worldSection.probability) {
                ctx.lineWidth = 2;

                ctx.strokeStyle = CanvasDraw.randomizedColor(worldSection.borderColor, worldSection.flicker);

           //    tempRect.left 	= CanvasDraw.vectorToCanvasY(startVec, pos, size);
           //    tempRect.top 	= CanvasDraw.vectorToCanvasX(startVec, pos, size);
           //    tempRect.width 	= CanvasDraw.vectorToCanvasY(sizeVec, pos, size);
           //    tempRect.height = CanvasDraw.vectorToCanvasX(sizeVec, pos, size);

                ctx.beginPath();
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.top );
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.width ,tempRect.top );
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.width ,tempRect.height);
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.height);
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.top );
                ctx.stroke();

                ctx.fillStyle = CanvasDraw.randomizedColor(worldSection.color, worldSection.flicker);
                ctx.fillRect(
                    tempRect.left+1 ,
                    tempRect.top-1  ,
                    tempRect.width - tempRect.left -1,
                    tempRect.height - tempRect.top +1
                );
            }

        };

        CanvasDraw.clearElement = function(ctx, size) {
            ctx.fillStyle = CanvasDraw.toRgba([0, 0, 0, 1]);
            ctx.fillRect(
                0,
                0,
                size.width ,
                size.height
            );
        };


        CanvasDraw.drawElementBorders = function(ctx, elementBorder, size) {
            if (Math.random() > elementBorder.probability) {
                return;
            }

            ctx.lineWidth = elementBorder.width*(1-elementBorder.flicker + Math.random()*elementBorder.flicker);

            ctx.strokeStyle = CanvasDraw.randomizedColor(elementBorder.color, elementBorder.flicker);

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, elementBorder.margin , elementBorder.margin );
            CustomGraphCallbacks.addPointToGraph(ctx, size.width - elementBorder.margin  ,elementBorder.margin);
            CustomGraphCallbacks.addPointToGraph(ctx, size.width - elementBorder.margin  ,size.height - elementBorder.margin );
            CustomGraphCallbacks.addPointToGraph(ctx,  elementBorder.margin , size.height - elementBorder.margin  );
            CustomGraphCallbacks.addPointToGraph(ctx,  elementBorder.margin , elementBorder.margin );
            ctx.stroke();

        };

        CanvasDraw.drawTargettingYaw = function(ctx, elementBorder, size, yawAim) {
            if (Math.random() > elementBorder.probability * 2) {
                return;
            }

            ctx.lineWidth = elementBorder.width*(1-elementBorder.flicker + Math.random()*elementBorder.flicker);

            ctx.strokeStyle = CanvasDraw.randomizedColor(elementBorder.color, elementBorder.flicker);

            yawAim = size.width * Math.sqrt(yawAim*4)*0.1;


            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx,  size.width*0.52 + yawAim, size.height - elementBorder.margin  -5);
            CustomGraphCallbacks.addPointToGraph(ctx,  size.width*0.52 + yawAim, elementBorder.margin+5);
            ctx.stroke();

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx,  size.width*0.48 - yawAim , elementBorder.margin+5);
            CustomGraphCallbacks.addPointToGraph(ctx,  size.width*0.48 - yawAim,  size.height - elementBorder.margin -5);
            ctx.stroke();

        };

        CanvasDraw.drawTargettingPitch = function(ctx, elementBorder, size, pitchAim) {
            if (Math.random() > elementBorder.probability * 2) {
                return;
            }

            ctx.lineWidth = elementBorder.width*(1-elementBorder.flicker + Math.random()*elementBorder.flicker);

            ctx.strokeStyle = CanvasDraw.randomizedColor(elementBorder.color, elementBorder.flicker);

            pitchAim = size.height * Math.sqrt(pitchAim*4)*0.1;


            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, size.height - elementBorder.margin -5 ,  size.height*0.52 + pitchAim);
            CustomGraphCallbacks.addPointToGraph(ctx, elementBorder.margin+5                ,  size.height*0.52 + pitchAim);
            ctx.stroke();

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, elementBorder.margin+5                ,  size.height*0.48 - pitchAim);
            CustomGraphCallbacks.addPointToGraph(ctx, size.height - elementBorder.margin -5 ,  size.height*0.48 - pitchAim);
            ctx.stroke();

        };


        CanvasDraw.drawRaster = function(ctx, raster, size) {

            ctx.strokeStyle = CanvasDraw.randomizedColor(raster.color, raster.flicker);

            for (var i = 0; i < size.height/2; i++) {

                if (Math.random() < raster.probability) {

                    ctx.lineWidth = raster.width * Math.random();

                    CustomGraphCallbacks.startGraph(ctx, 0, i*2);

                //    pathVec.data[0] = path[i]+centerX;
                //    pathVec.data[1] = path[i]+centerY;

                    CustomGraphCallbacks.addPointToGraph(ctx, size.width, i*2);
                    ctx.stroke();
                    i++
                }
            }
        };


        CanvasDraw.drawRadialRaster = function(ctx, raster, size) {

            ctx.strokeStyle = CanvasDraw.randomizedColor(raster.color, raster.flicker);

            for (var i = 0; i < size.height/2; i++) {

                if (Math.random() < raster.probability) {

                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.arc(
                        size.width*0.5,
                        size.height*0.5,
                        Math.sqrt(raster.width*i)+i * 1.2,
                        Math.PI*Math.random() + Math.PI * 0.6 * Math.random(),
                        Math.random() * Math.PI + 0.6 * Math.random()
                    );
                    ctx.stroke();
                    i++
                }
            }
        };


        CanvasDraw.drawControlVectorArc = function(ctx, tempRect, direction, angle, radius, color, width) {

            ctx.lineWidth = width;
            ctx.strokeStyle = CanvasDraw.toRgba(color);

            ctx.beginPath();
            ctx.arc(
                tempRect.left,
                tempRect.top,
                radius,
                direction,
                angle
            );
            ctx.stroke();

        };


        CanvasDraw.plotRotationState = function(ctx, tempRect, direction, angle, radius, color, width) {

            ctx.lineWidth = width;
            ctx.strokeStyle = CanvasDraw.randomizedColor(color, 0.5);

            direction -= Math.PI*0.5;

            var addx = radius * Math.cos(direction);
            var addy = radius * Math.sin(direction);

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
            ctx.stroke();

            var ang1 = -angle + Math.PI * 0.4;
            var ang2 = Math.PI-angle - Math.PI * 0.4;

            var ang1 = direction - Math.PI*0.5 + Math.max(angle , 0);

            var ang2 = direction - Math.PI*0.5 + Math.min(angle , 0);

            CanvasDraw.drawControlVectorArc(ctx, tempRect, -ang1, -ang2, radius, color, width);

        };


        CanvasDraw.drawPitchAndRollState = function(gamePiece, ctx, confData, widgetConfigs) {

                var size = confData.size;


                ctx.strokeStyle = CanvasDraw.toRgba([0.6,0.7,0.9, 1]);
                ctx.lineWidth = 1;

                var pitch = gamePiece.piece.spatial.pitch();



                ctx.beginPath();
                CustomGraphCallbacks.addPointToGraph(ctx, 5 ,             pitch*size.height + size.height * 0.5);
                CustomGraphCallbacks.addPointToGraph(ctx, size.width - 5 ,pitch*size.height + 0.5);
                ctx.stroke();


        };

        return CanvasDraw

    });

