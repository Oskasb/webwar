"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var ButtonEventDispatcher = function() {

            var _this = this;

            var processButtonEvent = function(e) {
                _this.processButtonEvent(evt.args(e).category, evt.args(e).data)
            };

            evt.on(evt.list().BUTTON_EVENT, processButtonEvent);
        };

        
        
        ButtonEventDispatcher.prototype.processButtonEvent = function(category, data) {

            for (var key in data) {
                evt.fire(evt.list().MESSAGE_UI, {channel: 'button_update', message: key +':'+ data[key]});
            }
            
            PipelineAPI.setCategoryData(category, data);
        };

       

        return ButtonEventDispatcher;

    });