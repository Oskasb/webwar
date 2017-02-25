"use strict";

define([

    ],
    function(
    ) {

        var gameScreen = document.body;
        var landscape;
        var width;
        var height;
        var top;
        var left;
        var resolution;
        var element;
        var scalePercentToX;
        var scalePercentToY;
        var sizeFactor;

        var percentZoom = 900;

        var registerAppContainer = function(elem) {

            element = elem;
            element.oncontextmenu = function() { return false; };
            gameScreen = element;
            gameScreen.style.pointerEvents = 'auto';

            setTimeout(function() {
                handleResize();
            }, 3000);

            setTimeout(function() {
                handleResize();
            }, 1000);

            setTimeout(function() {
                handleResize();
            }, 100);

        };

        var getResolution = function(width, height) {
            //	if (width < height) return height;
            return width;
        };

        var handleResize = function() {
            width = gameScreen.offsetWidth;
            height = gameScreen.offsetHeight;
            left = gameScreen.offsetLeft;
            top = gameScreen.offsetTop;
            resolution = getResolution(width, height);
            sizeFactor = resolution / percentZoom;
            document.body.style.fontSize = sizeFactor+"px";
            //	scalePercentToX = (1/percentZoom);// * width * ( resolution / width);
            //	scalePercentToY = (1/percentZoom);// * height* ( resolution / height);

            scalePercentToX = (1/percentZoom) * width * ( resolution / width);
            scalePercentToY = (1/percentZoom) * height* ( resolution / height);

        };

        var getAspect = function() {
            return width/height;
        };

        var getElement = function() {
            return gameScreen;
        };

        var getTop = function() {
            return top;
        };

        var getLeft = function() {
            return left;
        };

        var getWidth = function() {
            return width;
        };

        var getHeight = function() {
            return height;
        };

        var pxToPercentX = function(px) {
            return px/scalePercentToX;
        };

        var pxToPercentY = function(px) {
            return px/scalePercentToY;
        };

        var percentX = function(percent) {
            return  (width / resolution) *percent*scalePercentToX;
        };

        var percentY = function(percent) {
            return (height / resolution) *percent*scalePercentToY;
        };

        var widthRatio = function(percentx) {
            return percentx * width / percentZoom;
        };

        var heightRatio = function(percenty) {
            return percenty * height / percentZoom;
        };


        var percentToX = function(percent) {
            return (width / resolution) *percent*scalePercentToX * (percentZoom/100);
        };

        var percentToY = function(percent) {
            return (height / resolution) *percent*scalePercentToY * (percentZoom/100);
        };

        var pxToX = function(px) {
            return this.getPxFactor() * px;
        };

        var getPxFactor = function() {
            return (resolution / 1024) * scalePxToX
        };

        var getZoom = function() {
            return percentZoom;
        };

        var setLandscape = function(bool) {
            landscape = bool;
        };

        var getLandscape = function() {
            return landscape;
        };

        var setZoomFactor = function(factor) {
            return percentZoom = 100*factor;
        };


        var goFullscreen = function() {
            
                var el = document.body;

                if (el.requestFullscreen) {
                    el.requestFullscreen()
                } else if (el.msRequestFullscreen) {
                    el.msRequestFullscreen()
                } else if (el.mozRequestFullScreen) {
                    el.mozRequestFullScreen()
                } else if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen()
                }

        };


        var exitFullscreen = function() {

            function is() {
                return document.fullscreenElement || document.mozFullScreenElement ||
                    document.webkitFullscreenElement || document.msFullscreenElement
            }

            var el = document // is();

            if (el.exitFullscreen) {
                el.exitFullscreen()
            } else if (el.msExitFullscreen) {
                el.msExitFullscreen()
            } else if (el.mozCancelFullScreen) {
                el.mozCancelFullScreen()
            } else if (el.webkitExitFullscreen) {
                el.webkitExitFullscreen()
            }



        };

        return {
            registerAppContainer:registerAppContainer,
            notifyResize:handleResize,
            getElement:getElement,
            getWidth:getWidth,
            getHeight:getHeight,
            getTop:getTop,
            getLeft:getLeft,
            getZoom:getZoom,
            getAspect:getAspect,
            percentX:percentX,
            percentY:percentY,
            widthRatio:widthRatio,
            heightRatio:heightRatio,
            pxToPercentX:pxToPercentX,
            pxToPercentY:pxToPercentY,
            percentToX:percentToX,
            percentToY:percentToY,
            getLandscape:getLandscape,
            setLandscape:setLandscape,
            goFullscreen:goFullscreen,
            exitFullscreen:exitFullscreen
        }

    });