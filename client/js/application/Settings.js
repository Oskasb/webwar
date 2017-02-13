"use strict";

define([
	'data_pipeline/PipelineAPI',
	"Events"
],
	function(
		PipelineAPI,
		event
		) {

	var SystemBus = goo.SystemBus;		
		
		var curves = {
			"zeroToOne":    [[0, 0], [1, 1]],
			"oneToZero":    [[0, 1], [1, 0]],
			"zeroToOneExp": [[0, 0], [0.25, 0.1], [0.5, 0.25], [0.75, 0.5], [1, 1]],
			"quickFadeOut": [[0, 1], [0.9,1], [1,   0]],
			"quickFadeIn":  [[0, 0], [0.2,1], [1,   1]],
			"centerStep":   [[0, 0], [0.45,0],[0.55,1], [1, 1]],
			"quickInOut":   [[0, 0], [0.1,1], [0.9, 1], [1, 0]],
			"posToNeg":     [[0, 1], [1,-1]],
			"negToPos":     [[0,-1], [1, 1]],
			"zeroOneZero":  [[0, 0], [0.5,1], [1,  0]],
			"oneZeroOne":   [[0, 1], [0.5,0], [1,  1]],
			"growShrink":   [[0, 1], [0.5,0], [1, -2]]
		};

		var settingsVersion = 0.012;
		var LocalStoreId = "Settings";



		var SettingParams = function(name, min, max, curveId) {
			this.value;
			this.name = name;
			this.curveId = curveId;
			this.curve = curves[this.curveId];
			this.min = min;
			this.max = max;
		};

		var Setting = function(id) {
			this.id = id;
			this.processedValue;
		};

		Setting.prototype.applyConfigParams = function(params) {
			this.params = new SettingParams(params.name, params.min,  params.max, params.curveId);
			this.setValue(params.value);
		};

		Setting.prototype.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
			return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
		};

		Setting.prototype.valueFromCurve = function(value, curve) {
			for (var i = 0; i < curve.length; i++) {
				if (!curve[i+1]) return 0;
				if (curve[i+1][0] >= value) return this.getInterpolatedInCurveAboveIndex(value, curve, i)
			}
			return curve[i-1][1];
		};

		Setting.prototype.setValue = function(value) {
			if (value > this.params.max) {
				value = this.params.max
			} else if (value < this.params.min) (
			    value = this.params.min
			);

			if (this.params.value != value) {
				this.params.value = value;
				this.processValue();
				this.onStateChange();
			}
		};

		Setting.prototype.processValue = function() {
			this.processedValue = Math.round(100*(this.params.min + this.valueFromCurve(this.params.value / this.params.max, this.params.curve) * (this.params.max - this.params.min))) / 100;
		};

		Setting.prototype.getValue = function() {
			return this.params.value;
		};

		Setting.prototype.getProcessedValue = function() {
			return this.processedValue;
		};

		Setting.prototype.saveSetting = function() {
			saveData[this.id] = this.params;
			localStorage.setItem(LocalStoreId, JSON.stringify(saveData));
		};

		Setting.prototype.onStateChange = function() {
			SystemBus.emit("message_to_gui", {channel:'system_channel', message:["Setting Change", this.params.name+": "+this.processedValue]});
			Settings.fireOnChangeCallbacks(this.id, this.processedValue);

			this.saveSetting(this.id, this.params);
		};

		var list = {};
		var onChangeCallbacks = {};

		var saveData = {
			settingsVersion:settingsVersion
		};

		var savedJson = localStorage.getItem(LocalStoreId);


		var loadSetting = function(id, callback) {

			if (!savedJson) {
				return 1;
			}

			var savedSettings = JSON.parse(savedJson);

			if (savedSettings.settingsVersion != settingsVersion) {
				return 2;
			}

			if (!savedSettings[id]) {
				console.log("No setting ", id, savedSettings)
				return 3;
			}

			if (savedSettings.settingsVersion == settingsVersion) {
				callback(id, savedSettings[id]);
				return 4;
			}
		};

		var applySettingConfigData = function(id, params) {
			if (!list[id]) {
				list[id] = new Setting(id);
			}

			var onLoad = function(loadedId, loadedParams) {
				list[loadedId].applyConfigParams(loadedParams);
			};

			var loaded = loadSetting(id, onLoad);

			if (loaded != 4) {
				list[id].applyConfigParams(params)
			}

		};

		var setupQueue = [];

		var Settings = function() {};

		Settings.addOnChangeCallback = function(settingId, callback) {
			if (!onChangeCallbacks[settingId]) {
				onChangeCallbacks[settingId] = [];
			}

			if (onChangeCallbacks[settingId].indexOf(callback) == -1) {
				onChangeCallbacks[settingId].push(callback);
			} else {
				console.error("Setting callback function already registered: ", settingId, onChangeCallbacks[settingId]);
			}

			if (list[settingId]) {
				callback(list[settingId].getProcessedValue());
			} else {
			//	console.log("Setting Callback registered, setting not yet defined", settingId);
			}

		};

		Settings.fireOnChangeCallbacks = function(settingId, value) {
			if (!onChangeCallbacks[settingId]) {
				onChangeCallbacks[settingId] = [];
				setupQueue.push(settingId);
			}

			for (var i = 0; i < onChangeCallbacks[settingId].length; i++) {
				onChangeCallbacks[settingId][i](value)
			}

		};


		Settings.loadSettingConfigs = function() {
			var applyConfig = function(srcKey, data) {
				console.log("Setting data:", srcKey, data)
				for (var i = 0; i < data.length; i++) {
					applySettingConfigData(data[i].id, data[i].params)
				}
			};

			PipelineAPI.subscribeToCategoryKey('application_settings', 'controller', applyConfig);
			PipelineAPI.subscribeToCategoryKey('application_settings', 'sound', applyConfig);
			PipelineAPI.subscribeToCategoryKey('application_settings', 'display', applyConfig);
			PipelineAPI.subscribeToCategoryKey('application_settings', 'environment', applyConfig);
		};


		Settings.getSetting = function(settingId) {
			return list[settingId];
		};

		Settings.readSettingValue = function(settingId) {
			if (!list[settingId]) return false;
			return list[settingId].getValue();
		};

		var handleSettingChanged = function(e){
		    list[event.eventArgs(e).setting].setValue(event.eventArgs(e).value);
		};

		event.on(event.list().SETTING_CONTROL_EVENT, handleSettingChanged);

		return Settings;

	});