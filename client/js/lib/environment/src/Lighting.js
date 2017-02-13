"use strict";



define([

], function(
	
	) {

	var	ShaderBuilder = goo.ShaderBuilder;

	var Lighting = function(g00) {

		this.goo = g00;
		this.tempVec = new goo.Vector3();
		this.shadowReso = 128;
		this.shadowNear = 3.2;
		this.shadowSize = 25;
		this.shadowFar = 27;
		this.shadowType = "basic";
		this.baseFogNear = 5;
		this.baseFogFar = 200;
		this.sunBoost = 1.5;
		this.ambientBoost = 0.7;
		this.lightEntity;
		this.dirLight;
		this.lightComp;

	};

	ShaderBuilder.USE_FOG = true;
	ShaderBuilder.FOG_SETTINGS = [15, 400];

	Lighting.prototype.setBaseFogNearFar = function(fogNear, fogFar) {
		this.baseFogNear = fogNear;
		this.baseFogFar = fogFar;
	};

	Lighting.prototype.setSunlightColor = function(color) {
		this.dirLight.color.setDirect(color[0]*(1+Math.random()*0.003)*this.sunBoost, color[1]*(1+Math.random()*0.002)*this.sunBoost, color[2]*(1+Math.random()*0.005)*this.sunBoost, 1.0);
	};

	Lighting.prototype.setAmbientColor = function(color) {
		ShaderBuilder.GLOBAL_AMBIENT = [color[0]*(1+Math.random()*0.003)*this.ambientBoost, color[1]*(1+Math.random()*0.002)*this.ambientBoost, color[2]*(1+Math.random()*0.005)*this.ambientBoost, 1.0];
	};

	Lighting.prototype.setFogColor = function(color) {
		ShaderBuilder.FOG_COLOR = color;
	};

	Lighting.prototype.scaleFogNearFar = function(near, far) {
		this.setFogNearFar(this.baseFogNear*near, this.baseFogFar*far);
	};

	Lighting.prototype.setFogNearFar = function(near, far) {
		ShaderBuilder.FOG_SETTINGS = [near, far];
		ShaderBuilder.USE_FOG = true;
	};

	Lighting.prototype.setSunlightDirection = function(dir) {
		this.tempVec.set(dir[2], dir[1], dir[0]);
		//    lightEntity.transformComponent.transform.translation.set(dir);
		this.lightEntity.transformComponent.transform.lookAt(this.tempVec, goo.Vector3.UNIT_Y);
		this.lightEntity.transformComponent.setUpdated();
	};

	Lighting.prototype.setupMainLight = function() {
		console.log("Setup Main Light");

		this.lightEntity = this.goo.world.createEntity('Light1');
		this.dirLight = new goo.DirectionalLight();
		this.dirLight.color.setDirect(1, 0.95, 0.85, 1.0);
		this.dirLight.specularIntensity = 1;
		this.dirLight.intensity = 1;

		this.lightComp = new goo.LightComponent(this.dirLight);
		this.lightComp.light.shadowCaster = false;
		this.lightComp.light.shadowSettings.darkness = 0.9;
		this.lightComp.light.shadowSettings.near = this.shadowNear;
		this.lightComp.light.shadowSettings.far = this.shadowFar;
		this.lightComp.light.shadowSettings.size = this.shadowSize;
		this.lightComp.light.shadowSettings.shadowType = this.shadowType;
		this.lightComp.light.shadowSettings.resolution = [this.shadowReso,this.shadowReso];
		console.log("lightComp ---- ",this.lightComp);
		this.lightEntity.set(this.lightComp);

		this.lightEntity.transformComponent.transform.translation.setDirect(0, 0, 0);
		this.lightEntity.transformComponent.transform.lookAt(new goo.Vector3(-0.5,-0.4, 0.43), goo.Vector3.UNIT_Y);
		this.lightEntity.addToWorld();

		return this.lightEntity;
	};



	return Lighting;

});