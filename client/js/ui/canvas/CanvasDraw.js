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
                Math.abs(radius),
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


        CanvasDraw.drawPitchState = function(gamePiece, ctx, confData, widgetConfigs) {
            ctx.strokeStyle = CanvasDraw.toRgba([0.0,0.4,0.9, 1]);
            ctx.lineWidth = 1;

            var pitch = gamePiece.piece.spatial.pitch();

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, left+15     , (pitch+(roll*0.85))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, left+35     , (pitch+(roll*0.55))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.moveToPoint(ctx,     right - 35  , (pitch-(roll*0.55))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, right - 15  , (pitch-(roll*0.85))*h*size.height / MATH.TWO_PI + size.height * 0.5);

            ctx.stroke();

            var pitchVel = gamePiece.piece.spatial.pitchVel();

            ctx.lineWidth = 3;
            ctx.beginPath();


            CustomGraphCallbacks.addPointToGraph(ctx, left+3          , ((pitch+(roll*0.97))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, left+15         , ((pitch+(roll*0.85))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.moveToPoint(ctx,     right - 15      , ((pitch-(roll*0.85))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, right - 3       , ((pitch-(roll*0.97))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);

            ctx.stroke();

        };


        CanvasDraw.drawYawState = function(gamePiece, ctx, confData, widgetConfigs) {

            var size = confData.size;

            ctx.font = widgetConfigs.playerNames.font;
            ctx.strokeStyle = CanvasDraw.toRgba([0.1,0.2,0.6, 0.4]);
            ctx.fillStyle = CanvasDraw.toRgba([0.1,0.2,0.6, 0.4]);
            ctx.lineWidth = 1;

            var yaw = gamePiece.piece.spatial.yaw();
            var yawVel = gamePiece.piece.spatial.yawVel()*15;

            var w = 0.9;
            var left = size.width - size.width*w;
            var right = size.width - left;

            var h = 0.85;
            var bottom = size.height*h;

            var textFloor = -9;
            var pointFloor = 0;


            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, size.width*0.5    , bottom-0);
            CustomGraphCallbacks.addPointToGraph(ctx, size.width*0.5    , bottom-15);
            CustomGraphCallbacks.addPointToGraph(ctx, size.width*0.5-yawVel    , bottom-15);

            CustomGraphCallbacks.moveToPoint(ctx,     left-1    , bottom+6);
            CustomGraphCallbacks.addPointToGraph(ctx, left -1   , bottom-2);

            CustomGraphCallbacks.addPointToGraph(ctx, right  +1  , bottom-2);
            CustomGraphCallbacks.addPointToGraph(ctx, right    +1, bottom+6);

            ctx.stroke();

            CustomGraphCallbacks.drawPointAt(ctx, size.width*0.5-yawVel    , bottom-15, 3);

            ctx.lineWidth = 3;
            

            var angleN =  MATH.angleInsideCircle(yaw)   / MATH.TWO_PI;
            var pl = left+w*(right * angleN);
            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 3);
            CustomGraphCallbacks.addTextAt(ctx, 'N' , pl ,bottom-textFloor, null);

            var angleW = MATH.angleInsideCircle(yaw-Math.PI*0.5) / MATH.TWO_PI;
            pl = left+w*(right * angleW);
            CustomGraphCallbacks.drawPointAt(ctx, pl , bottom-pointFloor, 3);
            CustomGraphCallbacks.addTextAt(ctx, 'W' , pl ,bottom-textFloor, null);

            var angleS = MATH.angleInsideCircle(yaw-Math.PI)     / MATH.TWO_PI;
            pl = left+w*(right * angleS);
            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 3);
            CustomGraphCallbacks.addTextAt(ctx, 'S' , pl,bottom-textFloor, null);

            var angleE = MATH.angleInsideCircle(yaw+Math.PI*0.5) / MATH.TWO_PI;
            pl = left+w*(right * angleE);
            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 3);
            CustomGraphCallbacks.addTextAt(ctx, 'E' , pl,bottom-textFloor, null);



            var angleNW =  MATH.angleInsideCircle(yaw-Math.PI*0.25)   / MATH.TWO_PI;
            pl = left+w*(right * angleNW);

            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 2);


            var angleSW = MATH.angleInsideCircle(yaw-Math.PI*0.75) / MATH.TWO_PI;
            pl = left+w*(right * angleSW);

            CustomGraphCallbacks.drawPointAt(ctx, pl , bottom-pointFloor, 2);


            var angleSE = MATH.angleInsideCircle(yaw+Math.PI*0.75)     / MATH.TWO_PI;
            pl = left+w*(right * angleSE);

            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 2);


            var angleNE = MATH.angleInsideCircle(yaw+Math.PI*0.25) / MATH.TWO_PI;
            pl = left+w*(right * angleNE);
            CustomGraphCallbacks.drawPointAt(ctx, pl, bottom-pointFloor, 2);

        };

        CanvasDraw.drawPitchAndRollState = function(gamePiece, ctx, confData, widgetConfigs) {

            var size = confData.size;

            ctx.strokeStyle = CanvasDraw.toRgba([0.1,0.2,0.6, 0.4]);
            ctx.lineWidth = 1;

            var pitch = gamePiece.piece.spatial.pitch();
            var roll = gamePiece.piece.spatial.roll()*Math.PI;
            var pitchVel = gamePiece.piece.spatial.pitchVel();

            var w = 0.9;
            var h = 0.8;
            var left = size.width - size.width*w;
            var right = size.width - left;


            ctx.beginPath();

            CustomGraphCallbacks.addPointToGraph(ctx, left+15     , (pitch+(roll*0.85))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, left+35     , (pitch+(roll*0.55))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, left+35     , (size.height+(roll*0.85)) * 0.5);

            CustomGraphCallbacks.moveToPoint(ctx,     right-35    , (size.height-(roll*0.85)) * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, right - 35  , (pitch-(roll*0.55))*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, right - 15  , (pitch-(roll*0.85))*h*size.height / MATH.TWO_PI + size.height * 0.5);


            ctx.stroke();


            ctx.lineWidth = 3;
            ctx.beginPath();


            CustomGraphCallbacks.addPointToGraph(ctx, left+3          , ((pitch+(roll*0.97))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, left+12         , ((pitch+(roll*0.85))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.moveToPoint(ctx,     right - 12      , ((pitch-(roll*0.85))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);
            CustomGraphCallbacks.addPointToGraph(ctx, right - 3       , ((pitch-(roll*0.97))+pitchVel)*h*size.height / MATH.TWO_PI + size.height * 0.5);

            ctx.stroke();

        };

        return CanvasDraw

    });

