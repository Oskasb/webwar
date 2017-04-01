"use strict";

define([

],
	function(

		) {

        var fileServerUrl = "http://localhost:5001";

		var XhrThing = function() {

		};

		XhrThing.prototype.sendXHR = function(packet, successCallback, failCallback) {

			var body = "";

			var request = new XMLHttpRequest();
			request.packet = packet;

			var asynch = true;
			//    if (packet.contentType == 'application/x-www-form-urlencoded') asynch = false;

			request.open(packet.type, packet.url, asynch);

			if (packet.responseType == 'application/json') {
				request.responseType = 'json';
			} else if (packet.responseType) {
				request.responseType = packet.responseType;
			}

			if (packet.contentType == 'application/json') {
				//	body = JSON.stringify(packet.body);
				request.setRequestHeader("Content-Type", packet.contentType);
				//	request.setRequestHeader("Connection", "close");
			}

			if (packet.contentType == 'application/x-www-form-urlencoded') {
				body = packet.params;
				request.setRequestHeader("Content-Type", packet.contentType);

				//    request.setRequestHeader("Content-length", packet.params.length);
				//
			}

			if (packet.auth) request.setRequestHeader('Authorization', packet.auth.header);

			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					successCallback(request.response, request.packet);
				}
			};

			request.onError = function() {
				failCallback(packet.url, "XHR Fail!")
			};

			request.send(body);
		};



		XhrThing.prototype.saveJson = function(packet, json) {
            var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
            xmlhttp.open("POST", fileServerUrl+'/'+packet.fileUrl);
            xmlhttp.setRequestHeader("Content-Type", "text/json");
            xmlhttp.send(JSON.stringify([packet.fileUrl, packet.data]));

		};


		return XhrThing;

	});