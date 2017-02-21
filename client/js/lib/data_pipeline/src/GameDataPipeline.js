"use strict";

define([
		'data_pipeline/pipes/JsonPipe',
		'data_pipeline/pipes/SvgPipe',
		'data_pipeline/pipes/ImagePipe'
	],
	function(
		JsonPipe,
		SvgPipe,
		ImagePipe
	) {

		var GameDataPipeline = function() {

		};

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail)
		};


		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail) {
			SvgPipe.loadSvg(url, dataUpdated, fail)
		};

		GameDataPipeline.loadImageFromUrl = function(url, dataUpdated, fail) {
			ImagePipe.registerPollCallback(url, dataUpdated);
			ImagePipe.loadImage(url, dataUpdated, fail)
		};
		GameDataPipeline.loadGooBundleFromUrl = function(path, goo, url, fileName, dataUpdated, fail) {
			GooPipe.loadBundleFromFolderUrl(path, goo, url, fileName, dataUpdated, fail)
		};

		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
			ImagePipe.tickImagePipe(tpf);
		};

		GameDataPipeline.applyPipelineOptions = function(opts, pipelineErrorCb, ConfigCache) {
			JsonPipe.setJsonPipeOpts(opts.jsonPipe, pipelineErrorCb, ConfigCache);
			SvgPipe.setSvgPipeOpts(opts.svgPipe, pipelineErrorCb);
			ImagePipe.setImagePipeOpts(opts.imagePipe, pipelineErrorCb);
		};

		setInterval(function() {
			GameDataPipeline.tickDataLoader(0.03)
		}, 30)

		return GameDataPipeline
	});