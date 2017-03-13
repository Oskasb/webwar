"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var handlers;
       var sentStack = [];
        var receiveStack = [];
        var serverBusy = [0];
        var serverIdle = [0];
        var serverTime = [0];
        var serverPieces = [0];
        var serverPlayers = [0];


        var recycleStack = function(trackStack) {
            var recycle = trackStack.pop();
            recycle[0] = 0.3;
            trackStack.unshift(recycle);
        };
        
        


        var addServerStatusData = function(resData) {
            recycleStack(serverBusy);
            recycleStack(serverIdle);
            recycleStack(serverTime);
            recycleStack(serverPieces);
            recycleStack(serverPlayers);
            serverBusy[0][0] = resData.busy;
            serverIdle[0][0] = resData.idle;
            serverTime[0][0] = resData.idle + resData.busy;
            serverPieces[0][0] = resData.pieces;
            serverPlayers[0][0] = resData.players;
            evt.fire(evt.list().MONITOR_STATUS, {SERVER_BODIES:resData.bodies});
            evt.fire(evt.list().MONITOR_STATUS, {BODY_CONTACTS:resData.contacts});
            evt.fire(evt.list().MONITOR_STATUS, {SERVER_PIECES:resData.pieces});
            evt.fire(evt.list().MONITOR_STATUS, {SERVER_PLAYERS:resData.players});
        };

        var handleServerMessage = function(e) {
            var res = evt.args(e);
            if (res.id == 'server_status') {

                for (var i = 0; i < res.data.length; i++) {
                    addServerStatusData(res.data[i]);
                }
            }
            receiveStack[0][0] += 1;
        };

        var handleSendRequest = function() {
            sentStack[0][0] += 1;
        };

        var GooTrafficGraph = function() {

        //    this.containerStyle = containerStyle;
            var  _this = this;

            this.barCount = 1;
            this.lastBar = 0;
            this.currentBar = 0;

            this.biggestValue = 0.2;
            this.smallestValue = 0.5;
            this.idealValue = 0.016;
            this.valueSum = 0;
            this.valueAverage = 0;

            this.progressBars = [];

            var trackCB = function(e) {
                _this.trackFrame(evt.args(e));
            };

            handlers = {
                trackCB:trackCB
            }

        };


        GooTrafficGraph.prototype.getSends = function() {
            return sentStack;
        };

        GooTrafficGraph.prototype.getRecieves = function() {
            return receiveStack;
        };

        GooTrafficGraph.prototype.getServerIdle = function() {
            return serverIdle;
        };

        GooTrafficGraph.prototype.getServerBusy = function() {
            return serverBusy;
        };

        GooTrafficGraph.prototype.getServerTime = function() {
            return serverTime;
        };

        GooTrafficGraph.prototype.getServerPieces = function() {
            return serverPieces;
        };

        GooTrafficGraph.prototype.getServerPlayers = function() {
            return serverPlayers;
        };

        GooTrafficGraph.prototype.trackFrame = function() {

            recycleStack(sentStack);
            recycleStack(receiveStack);

        };

        GooTrafficGraph.prototype.buildStack = function(dataStack, barCount) {

            dataStack.length = 0;
            for (var i = 0; i < barCount; i++) {
                dataStack.push([0]);
            }

        };


        GooTrafficGraph.prototype.enableTrafficTracker = function(barCount) {

            this.barCount = barCount;

            for (var i = 0; i < this.barCount; i++) {
                this.buildStack(sentStack, barCount);
                this.buildStack(receiveStack, barCount);
                this.buildStack(serverBusy, barCount);
                this.buildStack(serverIdle, barCount);
                this.buildStack(serverTime, barCount);
                this.buildStack(serverPieces, barCount);
                this.buildStack(serverPlayers, barCount);

            }
            
            this.disableTracker();

            var _this = this;

            var setup = function() {
                _this.barCount = barCount;
                evt.on(evt.list().CLIENT_TICK, handlers.trackCB);
                
            };

            setTimeout(function() {
                setup();
            }, 100);


                evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
                evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);


        };

        GooTrafficGraph.prototype.disableTracker = function() {
            evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
            evt.removeListener(evt.list().SERVER_MESSAGE, handleServerMessage);
            evt.removeListener(evt.list().CLIENT_TICK, handlers.trackCB);
        };

        return GooTrafficGraph;

    });