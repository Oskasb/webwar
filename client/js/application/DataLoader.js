"use strict";


define([
        'Events',
        'PipelineAPI',
        'PipelineObject',
        'ui/dom/DomLoadScreen',
        'ui/GameScreen',
        'ThreeAPI'
    ],
    function(
        evt,
        PipelineAPI,
        PipelineObject,
        DomLoadScreen,
        GameScreen,
        ThreeAPI
    ) {

        var client;
        var loadProgress;
        var filesLoadedOK = false;
        var clientInitiated = false;
        
        var path = './../../..';

        var loadUrls = [
            './../../../Transport/MATH.js',
            './../../../Transport/io/Message.js',
            './../../../Transport/io/SocketMessages.js',
            './../../../Transport/MODEL.js',
            './../../../Transport/GAME.js'
        ];

        var dataPipelineSetup = {
            "jsonPipe":{
                "polling":{
                    "enabled":false,
                    "frequency":10
                }
            },
            "svgPipe":{
                "polling":{
                    "enabled":false,
                    "frequency":2
                }
            },
            "imagePipe":{
                "polling":{
                    "enabled":false,
                    "frequency":2
                }
            }
        };

        var pipelineOn = false;
        window.jsonConfigUrls = 'client/json/';
        if (window.location.href == 'http://127.0.0.1:5000/' || window.location.href ==  'http://localhost:5000/' || window.location.href ==  'http://192.168.0.100:5000/') {
            pipelineOn = true;
        }

        var jsonRegUrl = './client/json/config_urls.json';

        var setDebug = function(key, data) {
            SYSTEM_SETUP.DEBUG = data;
        };


        var DataLoader = function() {

            loadProgress = new DomLoadScreen(GameScreen.getElement());

        };

        var loadStates= {
            SHARED_FILES:'SHARED_FILES',
            CONFIGS:'CONFIGS',
            IMAGES:'IMAGES',
            COMPLETED:'COMPLETED'
        };

        var loadState = loadStates.SHARED_FILES;

        DataLoader.prototype.preloadImages = function() {
            
            var imageOk = function(src, data) {
        //        console.log("imageok:", src, data);
            };

            var imageFail = function(src, err) {
        //        console.log("image cache fail", erc, err)
            }

            ThreeAPI.initThreeLoaders();

            var styles = PipelineAPI.getCachedConfigs()['styles'];

            console.log("STYLES ", styles);

            var imageStore = [];

            for (var key in styles) {

                if (styles[key].backgroundImage) {
                    if (imageStore.indexOf(styles[key].backgroundImage)) {
                        imageStore.push(styles[key].backgroundImage);
                        PipelineAPI.cacheImageFromUrl(styles[key].backgroundImage, imageOk, imageFail);
                    }
                }
            }

        //    console.log("Image count: ", imageStore.length, imageStore)


        };

        DataLoader.prototype.getStates = function() {
            return loadStates;
        };
        
        DataLoader.prototype.setupPipelineCallback = function(loadStateChange) {

        };
        
        DataLoader.prototype.loadData = function(Client, PointerCursor, sceneController) {

            var _this = this;

            var initClient = function(ready) {
                if (client) {
                    console.log("Multi Inits requested, bailing");
                    return;
                }
                client = new Client(new PointerCursor());

                client.setupSimulation(sceneController, ready);

            };

            function connectionReady() {
             //   console.log('connectionReady do notifyCompleted')
                _this.notifyCompleted();
            }


        //    var particlesReady = function() {
                particles = true;

            //    evt.removeListener(evt.list().PARTICLES_READY, particlesReady);
        //    };

            function connectClient() {
                console.log('connectClient')
                client.initiateClient(new SocketMessages(), connectionReady);
            }
            

            var loadStateChange = function(state) {
            //    console.log('loadStateChange', state)
                if (state == _this.getStates().IMAGES) {



                    _this.preloadImages();
                }
                

                if (state == _this.getStates().COMPLETED) {

                    var clientReady = function() {
                        connectClient();
                    }
                    
                    
                    setTimeout(function() {
                        initClient(clientReady);
                    }, 10);

                }

            };

            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:window.location.href});
            
            function pipelineCallback(started, remaining, loaded) {
            //    console.log("SRL", started, remaining, loaded);

                PipelineAPI.setCategoryKeyValue("STATUS", "FILE_CACHE", "OK "+loaded);

                loadProgress.setProgress(loaded / started);

                if (loadState == loadStates.IMAGES && remaining == 0) {
                //    console.log("IMAGE COMPLETED", started, remaining, loaded);
                    loadState = loadStates.COMPLETED;
                    PipelineAPI.setCategoryData('STATUS', {PIPELINE:pipelineOn});
                    PipelineAPI.subscribeToCategoryKey('setup', 'DEBUG', setDebug);
                    loadStateChange(loadState);
                }

                if (loadState == loadStates.CONFIGS && remaining == 0) {
                    console.log( "json cached:", PipelineAPI.getCachedConfigs());
                    loadState = loadStates.IMAGES;
                    loadStateChange(loadState);
                }

                if (loadState == loadStates.SHARED_FILES && remaining == 0) {
                    console.log( "shared loaded....")
                    loadState = loadStates.CONFIGS;
                    loadStateChange(loadState);
                }
            }

            PipelineAPI.addProgressCallback(pipelineCallback);


            var sharedFilesLoaded = function() {
         //       console.log('sharedFilesLoaded')
                evt.fire(evt.list().SHARED_LOADED, {});
                function pipelineError(src, e) {
                    console.log("Pipeline error Ready", src, e);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
                }
                evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:"Request Worker Fetch"});
                PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);

            };


            var sharedLoaded = function() {
        //        console.log("Shared Loaded:", count, loadUrls.length, PipelineAPI.checkReadyState());

                evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:"Shared Loaded"});
                setTimeout(function() {

                    _this.setupPipelineCallback(loadStateChange);
                    sharedFilesLoaded();
                }, 20);

            };


            var filesLoaded = function() {

                    setTimeout(function() {
                        sharedLoaded();
                    }, 20)
                
            };




            var loadJS = function(url, location){

                var scriptTag = document.createElement('script');
                scriptTag.src = url;

                var scriptLoaded = function(e) {
                    if (loadUrls.length != 0) {
                        loadJS(loadUrls.shift(), document.body);
                    } else {
                //        console.log('scripts loaded',e);
                        filesLoaded();
                    }
                };


                scriptTag.addEventListener('load', scriptLoaded);
                location.appendChild(scriptTag);
            };

            var count = 0;

            var pipelineReady = function() {
                loadJS(loadUrls.shift(), document.body);
            };

            var particles = false;




        //    evt.once(evt.list().PARTICLES_READY, particlesReady);

            PipelineAPI.addReadyCallback(pipelineReady);



        };


        DataLoader.prototype.notifyCompleted = function() {
            evt.fire(evt.list().PLAYER_READY, {});
            loadProgress.removeProgress();
        };        

        return DataLoader;

    });


