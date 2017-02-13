"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var DomButton = function() {
            this.active = false;

        };
        
        DomButton.prototype.setupReady = function(parent, domElem, buttonData) {
            if (this.active) return;
            
            var state = {
                pressed:false,
                active:PipelineAPI.readCachedConfigKey(buttonData.event.category, buttonData.event.key),
                value:true
            };

            var data = {};
            data[buttonData.event.key] = state.value;

            var onHover = function() {

            };

            var onPress = function() {

            };

            var onActive = function(key, value) {

                if (key != buttonData.event.key) {
                    console.log("Wong Key? ", key);
                    return
                }

                state.active = value;
                notifyActive()
            };

            var notifyActive = function() {

            };

            var enableActive = function(data) {
                domElem.enableActive(data.active.style);
                notifyActive = function() {
                    domElem.setActive(state.active);
                };
            };
            
            var onClick = function() {
                
                state.value = !state.active;

                data[buttonData.event.key] = state.value;
                evt.fire(evt.list().BUTTON_EVENT, {category:buttonData.event.category, data:data});
            };


            if (buttonData.event.type == 'toggle') {
                PipelineAPI.subscribeToCategoryKey(buttonData.event.category, buttonData.event.key, onActive);
            }
            
            var callback = function(key, data) {
                domElem.setHover(data.hover.style, onHover);
                domElem.setPress(data.press.style, onPress);
                domElem.setClick(onClick);

                if (buttonData.event.type == 'toggle') {
                    enableActive(data);
                    notifyActive()
                }
            };

            PipelineAPI.subscribeToCategoryKey('ui_buttons', buttonData.id, callback);
            this.active = true;
        };
         
        
        return DomButton;

    });


