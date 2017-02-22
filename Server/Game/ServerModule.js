ServerModule = function(moduleId, data, piece, serverModuleCallbacks) {
    this.id = moduleId;
    this.data = data;
    this.piece = piece;
    this.serverModuleCallbacks = serverModuleCallbacks;
    this.state = {value:null};
    this.lastValue = 'noValue';
    this.masterState;
    this.getState = [];
    this.time = 0;
    this.delay = data.applies.delay || 0.1;
    this.cooldown = data.applies.cooldown || 0.5;

    if (this.data.rigid_body) {
        this.attachRigidBody(this.data.rigid_body)
    }
};

ServerModule.prototype.attachRigidBody = function(rigidBodyParams) {
    console.log("Attach RB", this.data.rigid_body);
    this.piece.physics = {};
    this.piece.physics.rigid_body = rigidBodyParams;
};


ServerModule.prototype.getModuleCooldown = function() {
    return this.cooldown;
};

ServerModule.prototype.getModuleDelay = function() {
    return this.delay;
};


ServerModule.prototype.setModuleState = function(state) {

    if (this.id == 'shield')  {
        //    console.log("Set Shield module state: ", state)
    }

    if (typeof(state) === 'undefined') {
        if (this.id === "input_target_select") {
       //     console.log("Server state undefined for module", "input_target_select");
        } else {

        }
        return;
    };

    this.state.value = state;
};

ServerModule.prototype.setApplyCallback = function(callback) {
    this.appliedCallback = callback;
};


ServerModule.prototype.getModuleState = function() {
    this.getState[0] = this.state;
    return this.getState;
};


ServerModule.prototype.updateControlConstants = function(controls, constants, onOff) {
    for (var key in constants) {
        this.modifyControlConstants(controls, key, constants[key], onOff);
    }
};

ServerModule.prototype.modifyControlConstants = function(controls, constant, modifier, onOff) {

    if (onOff) {

        if (this.lastValue === 'noValue' && onOff === false) {
            console.log("Add noValue", constant, modifier);
            return;
        }

        console.log("Add modifier", constant, modifier);
        controls.constants[constant] += modifier;
    } else {

        if (this.lastValue === 'noValue' && onOff === false) {
            console.log("Remove noValue", constant, modifier);
            return;
        }

        console.log("Remove modifier", constant, modifier);
        controls.constants[constant] -= modifier;
    }

    this.lastValue = onOff;
};

ServerModule.prototype.processInputState = function(controls, actionCallback) {

    if (this.data.applies.type === 'toggle') {
        if (this.state.value != this.lastValue) {

            if (this.data.applies.control_constants) {
                if (this.state.value == false) console.log("is false");
                this.updateControlConstants(controls, this.data.applies.control_constants, this.state.value)
            }
        }


        // module controls itself...
        //    console.log(controls.inputState[this.data.source])
        //    if (this.id == 'shield')  console.log("Process Shield state: ", this.state.value)
        this.lastValue = this.state.value;
        return;
    }

    this.setModuleState(controls.inputState[this.data.source]);

    if (typeof(controls.actions[this.data.applies.action]) != undefined) {
        controls.actions[this.data.applies.action] = this.state.value;

        // only used for legacy fire cannon
        if (typeof(actionCallback) == 'function') {
            console.log("call action cb", this.data.applies.action);
        //    actionCallback(this.data.applies.action, this.state.value, this.data);
        }
    }

    this.lastValue = this.state.value;


};

ServerModule.prototype.processServerModuleState = function(tpf) {
//    if (this.state.value == this.lastValue) return;
    this.time += tpf;

    if (this.data.applies.master_module_id) {

        if (this.masterState == this.piece.getModuleById(this.data.applies.master_module_id).state.value) {

        } else {
            this.masterState = this.piece.getModuleById(this.data.applies.master_module_id).state.value;
            this.time = this.getModuleDelay();
        }

        if (!this.masterState) {
            return;
        }
    }


    if (this.time < this.getModuleCooldown()) return;
    this.time = 0;

    if (this.data.applies.action) {
        
        if (typeof(this.serverModuleCallbacks[this.data.applies.action]) == 'function') {
            this.serverModuleCallbacks[this.data.applies.action](this.piece, this.state.value, this.data);
        } else {
            console.log("ServerModuleCallback missing:", this.data.applies.action); 
        }
        
    } else {
    //    console.log("Actionless Module", this.id);
    }


};


