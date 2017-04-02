
"use strict";


define([
        'Events',
        'PipelineObject',
        'game/modules/ThreeModule'
    
    ],
    function(
        evt,
        PipelineObject,
        ThreeModule
    ) {

        var ClientModule = function(clientPiece, attachmentPoint, serverState) {

            this.clientPiece = clientPiece;
            this.id = attachmentPoint.data.module;
            this.parentId = attachmentPoint.parent;

            if (serverState) {
                this.state = serverState[0];
            } else {
                this.state = {value:false};
                console.log("Server state missing for module", this);
            }


            
            this.on = false;
            this.lastValue = null;

            this.threeModule = new ThreeModule(this, clientPiece,  attachmentPoint);
            
            var applyModuleData = function(src, data) {
            //    console.log("Module data", src, data);
                this.data = data;
                this.threeModule.setModuleData(data);


                clientPiece.registerModule(this);
            }.bind(this);

            this.pipeObj = new PipelineObject('MODULE_DATA', this.id, applyModuleData);
            
        };


        ClientModule.prototype.monitorClientModule = function (bool) {
            
            if (bool) {
                this.threeModule.addModuleDebugBox();
            } else  {
                this.threeModule.removeModuleDebugBox();
            }
            
        };
        
        
        ClientModule.prototype.buildGeometry = function () {
            this.threeModule.buildModel(this.clientPiece.threePiece.getParentObject3d());
        };
        
        ClientModule.prototype.attachModuleToParent = function (parentModule) {
            this.threeModule.attachToParent(parentModule);
        };

        ClientModule.prototype.enableClientModule = function () {
            this.threeModule.attachEffects();
        };

        ClientModule.prototype.disableClientModule = function () {
            this.threeModule.detatchEffects();
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
            this.threeModule.updateThreeModule(this.state.value);
        };

        ClientModule.prototype.removeClientModule = function () {
            this.pipeObj.removePipelineObject();
            this.threeModule.removeThreeModule();
            delete this;
        };
        
        return ClientModule
    });