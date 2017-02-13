"use strict";

define([
	'environment/editor/EnvEditorAPI',
	'environment/Water',
	'environment/EnvironmentData'
], function(
	EnvEditorAPI,
    Water,
    EnvironmentData
    ) {
	


    var DynamicEnvironment = function(lighting) {

		this.lighting = lighting;
	    this.waterSettings = EnvironmentData.waterSettings;

	    this.stepDuration;
	    this.stepProgress;
	    this.cycleIndex;
	    this.envState = {
		    sunLight     : new MATH.Vec3(0.7, 0.65, 0.5		),
		    sunDir       : new MATH.Vec3(-0.6, -0.3, -0.3	),
		    ambientLight : new MATH.Vec3(0.4, 0.4, 0.7		),
		    skyColor     : new MATH.Vec3(0.6, 0.6, 0.81		),
		    fogColor     : new MATH.Vec3(0.68, 0.71, 0.81	),
		    fogDistance  : new MATH.Vec3(0.1, 1.4			)
	    };

	    this.tempVec = new MATH.Vec3(0, 0, 0);
	    this.environments = EnvironmentData.cycles;
	    this.globals = EnvironmentData.globals;
	    this.lastUpdate = 2;


		this.lighting.setBaseFogNearFar(this.globals.baseFogNear, this.globals.baseFogFar);

	    this.cycleIndex = this.globals.startCycleIndex;
	    this.setDayStepDuration(this.globals.baseCycleDuration);

	    this.stepProgress = 0;

	    this.paused = false;

	    var enablePauseEnv = function(env) {
		    document.getElementById("time_pause").addEventListener('click', function() {
			    env.togglePauseTime();
		    }, false);
	    };

	//    enablePauseEnv(this);


	    var includeEnvEditor = function(env) {
		    var envEditorAPI = new EnvEditorAPI(env);
		    var enableEditButton = function(editorAPI) {
			    document.getElementById("EditEnvironment").addEventListener('click', function() {
				    editorAPI.openEnvEditor();
			    }, false);
		    };

		    enableEditButton(envEditorAPI);
	    };

	//    includeEnvEditor(this);


	    this.setCycleData(EnvironmentData.cycles);
    };

	DynamicEnvironment.prototype.setCycleData = function(envCycleData) {
		this.environments = envCycleData;
	};


	DynamicEnvironment.prototype.setGlobals = function(globals) {
		for (var key in globals) {
			this.globals[key] = globals[key];
		}
		this.setDayStepDuration(this.globals.baseCycleDuration);
	};


	DynamicEnvironment.prototype.removeWater = function() {
		this.water.removeWater();
	};


	DynamicEnvironment.prototype.addWater = function(goo, skySphere, resourcePath) {
		this.water = new Water(goo, skySphere, resourcePath);
	};

	DynamicEnvironment.prototype.setFogGlobals = function(near, far) {
		this.globals.baseFogNear = near;
		this.globals.baseFogFar  = far;
		this.lighting.setBaseFogNearFar(this.globals.baseFogNear, this.globals.baseFogFar);
		this.water.setBaseFogNearFat(this.globals.baseFogNear*4, this.globals.baseFogFar*48);
	};

	DynamicEnvironment.prototype.setDayStepDuration = function(duration) {
		this.stepDuration = duration / this.environments.length;
	};


	DynamicEnvironment.prototype.togglePauseTime = function() {
		this.paused = !this.paused;
		console.log("Pause env time: ", this.paused)
	};

	var envState = {
		fogColor:[],
		sunLight:[],
		ambientLight:[],
		sunDir:[],
		skyColor:[],
		fogDistance:[]
	}

	var copyArray3 = function(fromA, toA) {
		toA[0] = fromA[0];
		toA[1] = fromA[1];
		toA[2] = fromA[2];
	};

    DynamicEnvironment.prototype.getEnvironmentState = function() {
		copyArray3(this.envState.fogColor.data, envState.fogColor);
		copyArray3(this.envState.sunLight.data, envState.sunLight);
		copyArray3(this.envState.ambientLight.data, envState.ambientLight);
		copyArray3(this.envState.sunDir.data, envState.sunDir);
		copyArray3(this.envState.skyColor.data, envState.skyColor);
		copyArray3(this.envState.fogDistance.data, envState.fogDistance);

		return envState;
    };

    DynamicEnvironment.prototype.stepCycle = function() {
	    this.cycleIndex += 1;
	    this.stepProgress = 0;
        if (this.cycleIndex == this.environments.length) this.cycleIndex = 0;
    };

	DynamicEnvironment.prototype.applyEnvStateToColors = function() {
		var frameState = this.getEnvironmentState();
		this.lighting.setAmbientColor([this.envState.ambientLight.data[0], this.envState.ambientLight.data[1], this.envState.ambientLight.data[2]]);
		this.lighting.scaleFogNearFar(this.envState.fogDistance[0], this.envState.fogDistance[1]);
		this.lighting.setFogColor([frameState.fogColor[0],frameState.fogColor[1],frameState.fogColor[2]]);
		this.lighting.setSunlightDirection(this.envState.sunDir.data);
		this.lighting.setSunlightColor(this.envState.sunLight.data);
		if (this.water) {
			this.water.updateWaterEnvironment(frameState.sunLight, frameState.sunDir, frameState.fogColor, frameState.fogDistance)
		}
	};


	DynamicEnvironment.prototype.applyTimeOfDayUpdate = function(timeOfDay) {
		this.cycleIndex = Math.floor((timeOfDay * (this.environments.length-1)))
	};

    DynamicEnvironment.prototype.advanceTime = function(time) {
	    if (this.paused) return;
	    this.lastUpdate -= time;
	    this.stepProgress += time;

	//    document.getElementById("time_hint").innerHTML = "Cycle: "+this.environments[cycleIndex].name+" ("+cycleIndex+"/"+(this.environments.length-1)+") Progress:"+Math.round(stepProgress);
	    this.stepFraction = (time / this.stepDuration);
        if (this.stepProgress >= this.stepDuration) this.stepCycle();

    //    var nextIndex = cycleIndex+1;
    //   if (nextIndex >= environments.length) nextIndex = 0;

        for (var index in this.environments[this.cycleIndex].values) {
	        this.tempVec.setArray(this.environments[this.cycleIndex].values[index]);
	        this.envState[index].lerp(this.tempVec, this.stepFraction);
        }

		if (this.lastUpdate > 0) return;
	    this.lastUpdate = 0.4;
	    this.applyEnvStateToColors();
    };

    return DynamicEnvironment;

});