"use strict";


define([
        'Events',
        'PipelineAPI',
    'PipelineObject'
    ],
    function(
        evt,
        PipelineAPI,
        PipelineObject
    ) {

        var pieces = {};

        var ModuleMonitor = function() {

            var _this=this;

            var monitorStatus = function(src, bool) {
                _this.registerStatus(bool)
            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'MON_MODULES', monitorStatus);
        };


        var monitorModules = function(bool) {
            for (var key in pieces) {
                pieces[key].monitorModules(bool)
            }
        };

        var piecesUdated = function(src, data) {
            console.log(pieces);
            pieces = data;
            monitorModules(true);
        };

        ModuleMonitor.prototype.registerStatus = function(bool) {

            if (bool) {
                this.piecePipeline = new PipelineObject('GAME_DATA', 'PIECES', piecesUdated);
            } else if (this.piecePipeline) {
                this.piecePipeline.removePipelineObject();
                monitorModules(false);
            }
        };

        return ModuleMonitor;

    });