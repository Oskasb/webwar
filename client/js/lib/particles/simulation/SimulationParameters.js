"use strict";

define(function() {

	// Curve format:    [pointA, pointB]
	// Point:           [progress, amplitude]

	var curves = {
		"constantOne":  [[0, 1], [1, 1]],
		"zeroToOne":    [[0, 0], [1, 1]],
		"oneToZero":    [[0, 1], [1, 0]],
		"quickFadeOut": [[0, 1], [0.9,1], [1,   0]],
		"quickFadeIn":  [[0, 0], [0.2,1], [1,   1]],
		"attackIn":     [[0, 1], [0.1,0], [1,   0]],
		"centerStep":   [[0, 0], [0.45,0],[0.55,1], [1, 1]],
		"quickInOut":   [[0, 0], [0.1,1], [0.9, 1], [1, 0]],
		"posToNeg":     [[0, 1], [1,-1]],
		"negToPos":     [[0,-1], [1, 1]],
		"zeroOneZero":  [[0, 0], [0.5,1], [1,  0]],
		"oneZeroOne":   [[0, 1], [0.5,0], [1,  1]],
		"growShrink":   [[0, 1], [0.5,0], [1, -2]],
		"shrink":   	[[0, -0.3], [0.3, -1]]
	};

	var SimulationParameters = function(position, normal, simParams, effectData, particleDensity) {
		this.position = position;
		this.normal = normal;
		this.data = this.configureData(simParams, effectData, particleDensity);
	};


	SimulationParameters.prototype.addSimParam = function(data, simParam, effectData) {

			var value;

			if (effectData[simParam.param]) {
				value = effectData[simParam.param];
			} else {
				value = simParam.value
			}

			if (simParam.type == "curve" && typeof(value) == 'string') {
				data[simParam.param] = curves[value];
			} else {
				data[simParam.param] = value;
			}
	};


	SimulationParameters.prototype.configureData = function(simParams, effectData) {
		var data = {};

		for (var i = 0; i < simParams.length; i++) {
			this.addSimParam(data, simParams[i], effectData)
		}


		data.effectCount = data.count;
		return data;
	};

	return SimulationParameters
})
;