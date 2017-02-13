"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var handlers;

        var GooFpsGraph = function() {

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

        GooFpsGraph.prototype.generateGraph = function() {
            this.progressBars = [];
            for (var i = 0; i < this.barCount; i++) {
                var progress = [0];
                this.progressBars.push(progress);
            }
        };


        GooFpsGraph.prototype.trackFrame = function(args) {
    //        this.progressBars[this.currentBar].setLowlight();

    //        this.currentBar = args.frame % this.barCount;

            if (this.currentBar == 0) {
                this.valueSum = 0;
                this.biggestValue = args.tpf;
                this.smallestValue = args.tpf;
            }

            this.valueSum += args.tpf;
            this.valueAverage = this.valueSum / (this.currentBar+1);

            var progress = this.progressBars.pop();
            progress[0] = this.idealValue / args.tpf;
            this.progressBars.unshift(progress);


        //
            // 
            //   if (this.smallestValue > args.tpf) this.smallestValue = args.tpf;
        //    this.progressBars[this.currentBar].setProgress(this.idealValue / args.tpf );
        //    this.progressBars[this.currentBar].setHighlight();

        //    if (!SYSTEM_SETUP.DEBUG.trackTpfAverage) return;

        //        this.number.setText("TPF: "+Math.round(this.valueAverage*1000)+' ms');
        };

        GooFpsGraph.prototype.enableFpsTracker = function(barCount) {

            this.disableFpsTracker();

            var _this = this;

            var setup = function() {
                _this.barCount = barCount;
                _this.generateGraph();
                evt.on(evt.list().CLIENT_TICK, handlers.trackCB);
            };

            setTimeout(function() {
                setup();
            }, 100);

        };

        GooFpsGraph.prototype.disableFpsTracker = function() {
            evt.removeListener(evt.list().CLIENT_TICK, handlers.trackCB);
        };

        return GooFpsGraph;

    });