"use strict";

define([
	'environment/Sky'

],function(
	Sky
	) {
	var waterColorTexturePath = window.resourcePath+'assets/images/water';

	var sky;

	var EnvironmentAPI = function() {

	};


	EnvironmentAPI.setEnvironmentTimeOfDay = function(timeOfDay) {
		sky.setTimeOfDay(timeOfDay)
	};

	EnvironmentAPI.setEnvironmentTimeScale = function(timeScale) {
		sky.setTimeScale(timeScale)
	};

	EnvironmentAPI.setupEnvironment = function(goo) {
		sky = new Sky(goo);
	};

	EnvironmentAPI.addWaterSystem = function(goo) {
		sky.attachWaterSystem(goo, waterColorTexturePath);
	};

	EnvironmentAPI.removeWaterSystem = function() {
		sky.removeWaterSystem();
	};
	
	EnvironmentAPI.applyEnvironmentData = function(envData) {

		console.log("Applying env data: ", envData);
		sky.setEnvData(envData);
	};

	EnvironmentAPI.updateCameraFrame = function(tpf, cameraEntity) {
		sky.updateCameraFrame(tpf, cameraEntity);
	};

	return EnvironmentAPI;

});