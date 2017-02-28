"use strict";

define([
		'data_pipeline/worker/DataComparator',
		'data_pipeline/worker/BufferParser',
		'data_pipeline/worker/XhrThing'
	],
	function(
		DataComparator,
		BufferParser,
		XhrThing
	) {

		var bufferParser;

		var WorkerDataLoader = function() {
			this.dataComparator = new DataComparator();
			this.xhrThing = new XhrThing();
			bufferParser = new BufferParser();
		};


		var errorUrls = {};


		WorkerDataLoader.prototype.fetchJson = function(url, dc) {
			var packet = {
				responseType:'application/json',
				type:"GET",
				url:baseUrl+url
			};

			var responseFail = function(url, err) {
				if (errorUrls[url]) {
					if (errorUrls[url] == err) {
						postMessage(['error_unchanged', 'Unchanged Error:', err])
					} else {
						postMessage(['error_changed', 'Error Changed:', errorUrls[url]])
					}
				}
				errorUrls[url] = err;
				postMessage(['fail', url, err])
			};

			var _this = this;
			var checkJson = function(str) {
				dc.compareAndCacheJson(url, str, _this);
			};

			this.xhrThing.sendXHR(packet, checkJson, responseFail);
		};

		WorkerDataLoader.prototype.fetchSvg = function(url, dc) {
			var packet = {
				responseType:'application/text',
				type:"GET",
				url:baseUrl+url
			};

			var checkSvg = function(str) {
				dc.compareAndCacheSvg(url, str);
			};

			this.xhrThing.sendXHR(packet, checkSvg);
		};

		WorkerDataLoader.prototype.fetchBinary = function(url, dc) {
			var packet = {
				responseType:'arraybuffer',
				type:"GET",
				url:baseUrl+url
			};

			var checkBinary = function(res) {


				var byteArray = new Uint8Array(res);
			//	byteArray.slice(0, byteArray.length - 8);
			//	console.log("SLICE IT",  Math.sqrt(byteArray.length));

				dc.compareAndCacheBinary(url, byteArray);
			};

			this.xhrThing.sendXHR(packet, checkBinary);
		};

		WorkerDataLoader.prototype.fetchJsonData = function(url) {
			this.fetchJson(url, this.dataComparator)
		};



		WorkerDataLoader.prototype.fetchBinaryData = function(url) {

			this.fetchBinary(url, this.dataComparator);
		};


		WorkerDataLoader.prototype.fetchSvgData = function(url) {

			this.fetchSvg(url, this.dataComparator);
		};




		return WorkerDataLoader;

	});