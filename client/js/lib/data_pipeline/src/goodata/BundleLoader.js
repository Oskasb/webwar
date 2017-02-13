define([

	],
	function(

		) {
		"use strict";

		var loaders = {};

		function loadFromUrl(g00, refFile, fileName, success, fail) {

			var loader = new goo.DynamicLoader({
				world: g00.world,
				//    preloadBinaries: true,
				rootPath: refFile,
				beforeAdd:function(){return false} // return false to prevent auto-add to world
			});

			loader.load(fileName).then(function(data) {
				success(refFile, data, loader)
			}).then(null, function(error) {
				fail([refFile, fileName, error, loader]);
			});
		}

		function loadBundleData(g00, url, fileName, success, fail) {
			loadFromUrl(g00, url, fileName, success, fail)
		}

		return {
			loadBundleData:loadBundleData
		}
	});
