"use strict";


define([
        'ui/dom/DomMessage',
        'ui/GameScreen',
        'Events',
        'PipelineObject',
        'ui/dom/DomPopup'
    ],
    function(
        DomMessage,
        GameScreen,
        evt,
        PipelineObject,
        DomPopup
    ) {
        var domPopups = {};

        var requestName = function(name) {
    //        console.log("Popup request name: ", name)
            evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RequestProfileUpdate', data:{name:name}});
        };

        var popups = {
            PLAYER_PROFILE:{configId:"select_name", callback:requestName}
        };

        

        var UiMessenger = function() {
            var listening = false;
            var channels;

            function createMessage(e) {
                var chan = channels[evt.args(e).channel];
                if (!chan) return;
                var message = new DomMessage(GameScreen.getElement(), evt.args(e).message, chan.style, 0, 0, chan.time);
                message.animateToXYZ(chan.anim[0], chan.anim[1], chan.anim[2]);
            }

            function createMessagePopup(src, data) {
    //            console.log("popup", src, data)
                
                var onClose = function(value) {
                    console.log("Call Close", value);
                    popups[src].pipelineObject.setData(value);
                };
                
                if (data) {
                    domPopups[src] = new DomPopup(popups[src].configId, popups[src].callback, onClose);
                } else {
                    if (domPopups[src]) {
                        domPopups[src].removePopup();
                    }
                }
            }

            function setup(data) {
                channels = data;
                if (!listening) evt.on(evt.list().MESSAGE_UI, createMessage);
                listening = true;
            }


            function channelData(src, data) {
                setup(data);
            }

            new PipelineObject('messages', 'channels', channelData);


            for (var key in popups) {
    //            console.log("make popups", key)
                popups[key].pipelineObject =  new PipelineObject('MESSAGE_POPUP', key, createMessagePopup, false);
            };

         //   evt.on(evt.list().MESSAGE_POPUP, createMessagePopup);
            
        };
        
        return UiMessenger;

    });