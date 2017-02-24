"use strict";

define([
        'ui/GameScreen',
        'ui/dom/DomElement',
        'ui/dom/DomMessage',
        'Events'
    ],
    function(
        GameScreen,
        DomElement,
        DomMessage,
        evt
    ) {

        var InputSegmentRadial = function() {

            this.currentState = [0, 0];
            this.lastSensState = [0, 0];
            this.dirty = true;
            this.lastSendTime = 0;

            this.listenersEnabled = false;

            this.active = false;
            this.radians = 0;

            this.line = {
                w:0,
                zrot:0,
                fromX:0,
                fromY:0,
                toX:0,
                toY:0
            };

            this.offsetX = 20;
            this.offsetY = 20;

            this.pointer = {
                x:0,
                y:0
            };

            this.configs = {
                radialSegments:8,
                distanceSegments:3,
                radius: 50
            };

            this.vectors = [];
            this.distance = [0, 0, 0, 0];
            this.selectionIndex = 0;

        };


        InputSegmentRadial.prototype.applyConfigs = function(configs) {
            this.configs = configs.data;

            for (var i = 0; i < this.configs.radialSegments; i++) {
                this.vectors.push(0);
            }
        };



        InputSegmentRadial.prototype.registerControlledPiece = function(piece) {
            //    console.log("Register Control", piece);
            this.piece = piece;

            if (!this.listenersEnabled) {
                this.setupInputListeners();
            }

        };

        InputSegmentRadial.prototype.setupInputListeners = function() {

            var _this = this;

            var tickInput = function(e) {
                _this.tickInputFrame(evt.args(e).tpf);
            }

            var cursorLine = function(e) {
                _this.determineSelectedSegment(evt.args(e));
            };

            var cursorRelease = function(e) {
                _this.disableSegments(evt.args(e));
            };

            var cursorPress = function(e) {
                _this.enableSegments(evt.args(e));
            };

            evt.on(evt.list().CURSOR_RELEASE, cursorRelease);
            evt.on(evt.list().CURSOR_PRESS, cursorPress);
            evt.on(evt.list().CURSOR_LINE, cursorLine);
            evt.on(evt.list().CLIENT_TICK, tickInput);

            var removeListeners = function() {
                evt.removeListener(evt.list().CURSOR_RELEASE, cursorRelease);
                evt.removeListener(evt.list().CURSOR_PRESS, cursorPress);
                evt.removeListener(evt.list().CURSOR_LINE, cursorLine);
                evt.removeListener(evt.list().CLIENT_TICK, tickInput);
                evt.removeListener(evt.list().CONNECTION_CLOSED, removeListeners);
            };

            evt.on(evt.list().CONNECTION_CLOSED, removeListeners);

            this.listenersEnabled = true;
        };

        InputSegmentRadial.prototype.cursorLine = function(line) {

            //        this.root.hideElement();
        };

        InputSegmentRadial.prototype.disableSegments = function() {

            for (var i = 0; i < this.vectors.length; i++) {
                this.setDisabled(this.vectors[i]);
            }

            for (var i = 0; i < this.distance.length; i++) {
                this.setDisabled(this.distance[i]);
            }

            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), 'Release', 'ui_state_hint_off', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y + 30, 0, 1.5);
            }

            if (this.line != undefined) {
                this.line.toX = this.line.fromX;
                this.line.toY = this.line.fromY;
            }

            this.sendState();

        };

        InputSegmentRadial.prototype.enableSegments = function(mouse) {
            this.active = true;
            this.pointer = {
                x:mouse.x,
                y:mouse.y
            };

            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), 'Control', 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);
            }

        };



        InputSegmentRadial.prototype.setDisabled = function() {
            this.active = false;
        };

        InputSegmentRadial.prototype.determineSelectedSegment = function(line) {

            this.line = line;

            var distanceSegment = Math.min(this.configs.distanceSegments, Math.floor(this.configs.distanceSegments * (line.w / this.configs.radius*2)* (line.w / this.configs.radius*2)));

            var segs = this.configs.distanceSegments;

            var distanceSegment = Math.clamp(Math.round((line.fromX - line.toX ) / this.configs.radius) / segs, - 1, 1) ;

            if (this.currentState[1]!=distanceSegment) {
                this.currentState[1] = distanceSegment;
                if (SYSTEM_SETUP.DEBUG.renderInput) {

                    var message = new DomMessage(GameScreen.getElement(), "Length " + distanceSegment, 'ui_state_hint_on', this.pointer.x + 50, this.pointer.y - 30, 0.4);
                    message.animateToXYZscale(this.pointer.x + 50, this.pointer.y - 51, 0, 1.1);
                }
                this.dirty = true;
            }
            
            var radians = ((line.zrot + Math.PI) * (this.configs.radialSegments) / MATH.TWO_PI);



            var selection = MATH.moduloPositive(Math.clamp(Math.round(radians), 0 ,this.configs.radialSegments), this.configs.radialSegments) ;
            if (selection != this.selectionIndex) {

                this.dirty = true;
                this.currentState[0] = selection;

                this.selectionIndex = selection;
            }

            if (this.dirty) {
                this.segmentSelected();
                this.dirty = false;
            }

        };


        InputSegmentRadial.prototype.segmentSelected = function() {
            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), this.currentState, 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);
            }
        };


        InputSegmentRadial.prototype.sendState = function() {

            if (this.lastSensState[0] == this.currentState[0] && this.lastSensState[1] == this.currentState[1]) {
                return;
            }

            var vector = {
                state:this.currentState
            };

            evt.fire(evt.list().INPUT_PLAYER_CONTROL, {id:'InputVector', data:vector});
            
            this.lastSensState[0] = this.currentState[0];
            this.lastSensState[1] = this.currentState[1];
        };

        InputSegmentRadial.prototype.renderSegments = function(count, radius) {
            var angle = MATH.TWO_PI / count;

            for (var i = 0; i < this.vectors.length; i++) {
                var addx = (radius*0.2 / this.configs.distanceSegments) * Math.sin(angle*i);
                var addy = (radius*0.2 / this.configs.distanceSegments) * Math.cos(angle*i);
                //    this.vectors[i].renderPosRadial(this.pointer.x + addx, this.pointer.y + addy, radius, angle*i);

                var color = 'MAGENTA';

                if (i == this.currentState[0]) {
                    color = 'YELLOW';
                    evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:radius*0.03, angle:angle*i, color:color, anchor:'bottom_right'});
                } else {
                    //        evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:radius*0.03, angle:angle*i, color:color, anchor:'bottom_right'});
                }


            }
        };


        InputSegmentRadial.prototype.tickInputFrame = function(tpf) {

            if (this.active) {
                this.renderSegments(this.configs.radialSegments, this.configs.radius);
            }


            if (this.active && this.lastSendTime > this.configs.streamTimeout) {

                this.sendState();
                this.lastSendTime = 0;
            } else {
                this.lastSendTime += tpf;
            }

        };

        return InputSegmentRadial;

    });