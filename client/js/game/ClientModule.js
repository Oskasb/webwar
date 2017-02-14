
"use strict";


define([
        'Events',
    'PipelineObject'
    ],
    function(
        evt,
        PipelineObject
    ) {

        var ClientModule = function(clientPiece, attachmentPoint, serverState) {

            this.clientPiece = clientPiece;
            this.id = attachmentPoint.data.module;


            if (serverState) {
                this.state = serverState[0];
            } else {
                this.state = {value:false};
                console.log("Server state missing for module", this);
            }

            this.on = false;
            this.lastValue = null;
            
            var applyModuleData = function(src, data) {
            //    console.log("Module data", src, data);
                this.data = data;
                
                if (this.on) {
                    console.log("Module already on", this);
                    return;
                }

                this.gooModule = clientPiece.gooPiece.attachModule(this, attachmentPoint);
                this.gooModule.activateGooModule();
                
                this.threeModule = clientPiece.threePiece.attachModule(this, attachmentPoint);
                
                clientPiece.registerModule(this);
                this.on = true;
            //    moduleReadyCb(this);
            }.bind(this);

            this.pipeObj = new PipelineObject('MODULE_DATA', this.id, applyModuleData)
        };
        

        ClientModule.prototype.applyModuleServerState = function (serverState) {

            if (!serverState[this.id]) {
                console.log("No server state for", this.id);
                return;
            }
            
            this.state.value = serverState[this.id][0].value;
            this.notifyModuleStateForUi()
        };

        ClientModule.prototype.notifyModuleStateForUi = function () {

            if (this.state.value) {

                if (!this.on && this.clientPiece.isOwnPlayer) {
                    evt.fire(evt.list().NOTIFY_MODULE_ONOFF, {id:this.id, on:true})
                }

                this.on = true;
            } else {

                if (this.on && this.clientPiece.isOwnPlayer) {
                    evt.fire(evt.list().NOTIFY_MODULE_ONOFF, {id:this.id, on:false})
                }

                this.on = false;
            }

        };

        ClientModule.prototype.sampleModuleFrame = function () {
            if (this.state.value != this.lastValue) {
                this.lastValue = this.state.value;
            }
            this.gooModule.updateGooModule();
        };

        ClientModule.prototype.removeClientModule = function () {
            this.pipeObj.removePipelineObject();
            this.gooModule.removeModule();
                        
        };
        
        return ClientModule
    });