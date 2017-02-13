"use strict";

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43521007-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


define(["Events"],
    function(event) {

        var trackedStacks = 0;
        var controlStack={
            count:0,
            controls:{}
        };


        var addToQueue = function(category, action, labels, value) {
            if (value == undefined) return;
            console.log("TRACK:", [category, action, labels, value])
            _gaq.push(['_trackEvent', category, action, labels, value]);
        };

        var trackControlEvent = function(e) {
            var args = event.eventArgs(e);
            if (args.value == undefined) return;
            if (args.value != 1) return;
            controlStack.count += 1;
            if (!controlStack.controls[args.control]) controlStack.controls[args.control] = 0;
            controlStack.controls[args.control] += 1;

            if (controlStack.count >= 20) {
                trackedStacks+=1;
                addToQueue("PLAYER_CONTROL", JSON.stringify(controlStack.controls), ""+trackedStacks, controlStack.count);
                controlStack={
                    count:0,
                    controls:{}
                };
            }
        };

        var trackGameEvent = function(e) {
            var eventId = e.type;
            var args = event.eventArgs(e);
                var label = "";
            for (var index in args) {
                label += index+" "+args[index]+" "
            }
            addToQueue("USER ACTION", eventId, label, 1);
        };


        var explicitTrack = function(e) {
            var args = event.eventArgs(e);
            addToQueue(args.category, args.action, args.labels, args.value);
        };

    event.on(event.list().ANALYTICS_EVENT, explicitTrack);
//    event.registerListener(event.list().LOAD_3D, trackGameEvent);
//    event.registerListener(event.list().LOADING_COMPLETED, trackGameEvent);
//    event.registerListener(event.list().CONNECTION_OPEN, trackGameEvent);
//    event.registerListener(event.list().ENINGE_READY, trackGameEvent);
//    event.registerListener(event.list().LOADING_ENDED, trackGameEvent);

//    event.registerListener(event.list().PLAYER_CONTROL_EVENT, trackControlEvent);
});
