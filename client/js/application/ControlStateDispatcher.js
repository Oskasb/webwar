"use strict";


define([
        'Events',
        'PipelineObject'
    ],
    function(
        evt,
        PipelineObject
    ) {


        var messages = {
            TOGGLE_SHIELD:'shield',
            TOGGLE_HYPER:'hyper_drive',
            TOGGLE_TELEPORT:'warp_drive',
            TOGGLE_TARGET_SELECTED:'input_target_select',
            TOGGLE_ATTACK_ENABLED:'input_toggle_attack'
        };


        var data = {};

        var setupMessageData = function(src, stateValue) {
            data[messages[src]] = stateValue;
            return data;
        };

        var requestModuleState = function(src, stateValue) {

            if (!stateValue) {
                console.log("No Module State", src);
        //        return;
            }

            console.log("Request module state:", src, stateValue);
            evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ModuleStateRequest', data:setupMessageData(src, stateValue)});
        };

        var ControlStateDispatcher = function() {

            this.controlPipes = {};


            for (var key in messages) {
                this.controlPipes[messages[key]] = new PipelineObject('CONTROL_STATE', key, requestModuleState, false);
            }

            var handleModuleOnOff = function(e) {
                this.moduleToggled(evt.args(e))
            }.bind(this);

            evt.on(evt.list().NOTIFY_MODULE_ONOFF, handleModuleOnOff)
        };

        ControlStateDispatcher.prototype.moduleToggled = function(args) {
            if (!this.controlPipes[args.id]) {

                console.log("No module toggle handle for ", args.id, args.on, messages, this.controlPipes)
                return;
            }

            console.log("Module for ", args.id, args.on, args)

            if (this.controlPipes[args.id].readData() != args.on) {
                this.controlPipes[args.id].setData(args.on);
            }
        };

        return ControlStateDispatcher;

    });