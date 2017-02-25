"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        GameScreen
    ) {

        var FullScreenConfigurator = function() {

            this.currentValue = 0;



            PipelineAPI.setCategoryData('STATUS', {FULL_SCREEN:false});

            var _this=this;

            var apply = function(src, value) {
                setTimeout(function() {
                    _this.applyFullScreen(src, value)
                }, 100);

            };

            PipelineAPI.subscribeToCategoryKey('STATUS', 'FULL_SCREEN', apply);



            var processButtonEvent = function(e) {

                function toggleFullScreen() {


                    if (!_this.currentValue) {
                        elem.innerHTML = 'EXIT';
                        GameScreen.goFullscreen();
                    } else {
                        elem.innerHTML = 'FULL SCREEN';
                        GameScreen.exitFullscreen();
                    }


                }

                console.log("BUTTON EVT FULLSCREEN!", evt.args(e))

                if (evt.args(e).data.FULL_SCREEN) {

                    var elem = evt.args(e).element;

                    elem.innerHTML = 'SCREEN BOUND';
                    console.log("BIND EVT FULLSCREEN!", evt.args(e).data)

                    elem.addEventListener('click', function(e) {
                        //    if (e.keyCode == 13) {

                        console.log("TOGGLE FULLSCREEN!")
                        toggleFullScreen();
                        //    }
                    }, false);

                    evt.removeListener(evt.list().BUTTON_EVENT, processButtonEvent);
                }


            };

            evt.on(evt.list().BUTTON_EVENT, processButtonEvent);

            //   evt.on(evt.list().MONITOR_STATUS, applyDevConfig);
        };

        FullScreenConfigurator.prototype.applyFullScreen = function(src, value) {

            if (this.currentValue == value) {
                return
            }

            this.currentValue = value;


        };


        return FullScreenConfigurator;

    });