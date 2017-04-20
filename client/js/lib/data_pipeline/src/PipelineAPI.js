"use strict";

define(['data_pipeline/data/ConfigCache'],
	function(
		ConfigCache
		) {

		var pipeOptions = {};

		var PipelineAPI = function() {

		};

		PipelineAPI.addReadyCallback = function(cb) {
			ConfigCache.addReadyCallback(cb);
		};

		PipelineAPI.checkReadyState = function() {
			return ConfigCache.getReady();
		};

		PipelineAPI.addProgressCallback = function(callback) {
			ConfigCache.addProgressCallback(callback);
		};

		PipelineAPI.readCachedConfigKey = function(category, key) {
			return ConfigCache.getConfigKey(category, key)
		};

		PipelineAPI.subscribeToCategoryUpdate = function(category, onDataCallback) {
			return ConfigCache.registerCategoryUpdatedCallback(category, onDataCallback)
		};

		PipelineAPI.subscribeToCategoryKey = function(category, key, onDataCallback) {
			ConfigCache.subscribeToCategoryKey(category, key, onDataCallback)
		};

		PipelineAPI.removeCategoryKeySubscriber = function(category, key, onDataCallback) {
			ConfigCache.unsubscribeCategoryKey(category, key, onDataCallback)
		};
				

		PipelineAPI.meshCombineEntityList = function(entityList, combineDone) {
			ConfigCache.combineEntities(entityList, combineDone);
		};

		PipelineAPI.subscribeToConfigUrl = function(url, success, fail) {
			ConfigCache.cacheFromUrl(url, success, fail)
		};

		PipelineAPI.cacheSvgFromUrl = function(url, success, fail) {
			ConfigCache.cacheSvgFromUrl(url, success, fail)
		};

		PipelineAPI.cacheImageFromUrl = function(url, success, fail) {
			ConfigCache.cacheImageFromUrl(url, success, fail)
		};

		PipelineAPI.subscribeToImage = function(subscriberId, imageId, callback) {
			ConfigCache.subscribeToImageId(subscriberId, imageId, callback)
		};

		PipelineAPI.getCachedConfigs = function() {
			return ConfigCache.getCachedConfigs();
		};

		PipelineAPI.storeDataKey = function(data, dataKey) {
			for (var key in data[dataKey]) {
				PipelineAPI.setCategoryData(key, data[dataKey][key]);
			}
		};

		PipelineAPI.saveJsonFileOnServer = function(jsonData, url) {
	//		console.log("Save Json to Server", url, [jsonData]);
			ConfigCache.storeJsonAtUrl(jsonData, url);
		};
		
		PipelineAPI.setCategoryData = function(category, data) {
			var store = {};

			store[category] = data;
			return ConfigCache.dataCombineToKey(category, 'local', store);
		};

		PipelineAPI.setCategoryKeyValue = function(category, key, value) {
			var store = {};

			store[category] = {};
			store[category][key] = value;
			return ConfigCache.dataCombineToKey(category, 'local', store);
		};
		
		PipelineAPI.dataPipelineSetup = function(jsonIndexUrl, options, pipelineError) {
			for (var key in options) {
				pipeOptions[key] = options[key];
			}
			ConfigCache.applyDataPipelineOptions(jsonIndexUrl, options, pipelineError);
		};

		PipelineAPI.getPipelineOptions = function(key) {
			return pipeOptions[key];
		};

		PipelineAPI.sampleCacheReadCount = function() {
			var reads = ConfigCache.getCacheReads();
			ConfigCache.resetCacheReads();
			return reads;
		};

        PipelineAPI.tickPipelineAPI = function(tpf) {
            ConfigCache.tickConfigCache(tpf);
        };
        
		return PipelineAPI;
	});