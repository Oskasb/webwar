define(["EventList"], function(eventList) {

    var events = {};
    var listeners = {};
    var onceListeners = 0;

    var eventException = function(message) {
        this.name = "EventArgumentException";
        this.message = message;
    };

    eventException.prototype = Error.prototype;

    var list = function() {
        return eventList;
    };


    var validateEventArguments = function(event, arguments) {
        if (!event) console.log("NO EVENT", event)
        for (index in arguments) {

            if (typeof(event.args[index]) != typeof(arguments[index])) {
                throw new eventException("Invalid event arguments, "+event.type+" does not match type for supplied argument: "+index);
            }
        }
    };

    var TinyEvent = function(type) {
        this.type = type;
        this.arguments = {};
    };

    TinyEvent.prototype.setArgs = function(args) {
        this.arguments = args;
    };

    var setupEvent = function(event) {

        if (!events[event.type]) {
            listeners[event.type] = [];
            events[event.type] = new TinyEvent(event.type);
            fireEvent(list().MONITOR_STATUS, {EVENT_TYPES:getEventCount()});
        }
    };

    var generateEvent = function(event, arguments) {
    //    validateEventArguments(event, arguments);
        setupEvent(event);
        setEventArgs(event, arguments);
        return events[event.type];
    };

    var setEventArgs = function(e, args) {
        events[e.type].setArgs(args);
    };

    var eventArgs = function(e) {
        return events[e.type].arguments;
    };

    var dispatchEvent = function(event) {
        for (var i = 0; i < listeners[event.type].length; i++) {
            listeners[event.type][i](event);
        }
    };

    var fireEvent = function(event, arguments) {
        dispatchEvent(event, generateEvent(event, arguments));
    //    element.dispatchEvent(generateEvent(event, arguments));
        firedCount++;
    };

    var registerListener = function(event, callback) {
        setupEvent(event);
        listeners[event.type].push(callback);
        fireEvent(list().MONITOR_STATUS, {EVENT_LISTENERS:getListenerCount()});
    };



    var registerOnceListener = function(event, callback) {
        setupEvent(event);

        var remove = function() {
            removeListener(listeners[event.type], singleShot);
            onceListeners--;
            if (onceListeners < 0) {
                console.log("overdose singleshots", event);
            }
        };

        var call = function(args) {
            callback(args);
        };

        var singleShot = function(args) {

            call(args);
            remove();

    //        call = function() {
        //        console.log("multiple calls to once call...", args)
     //       };

    //        remove = function() {
        //        console.log("multiple removes to once call...", event, args)
    //        };

            fireEvent(list().MONITOR_STATUS, {LISTENERS_ONCE:onceListeners});
        //    },0);
        };


        onceListeners++;

        registerListener(event, singleShot);
    //    listeners[event.type].push(sincelShot);
        fireEvent(list().MONITOR_STATUS, {LISTENERS_ONCE:onceListeners});
    };



    var spliceListener = function(listeners, cb) {
        listeners.splice(listeners.indexOf(cb), 1);
        fireEvent(list().MONITOR_STATUS, {EVENT_LISTENERS:getListenerCount()});
    };

    var firedCount = 0;
    var eventCount = 0;
    var listenerCount = 0;

    var getFiredCount = function() {
        fireEvent(list().MONITOR_STATUS, {FIRED_EVENTS:firedCount});
        fireEvent(list().MONITOR_STATUS, {LISTENERS_ONCE:onceListeners});
        firedCount = 0;
    };

    var getListenerCount = function() {


        eventCount = 0;
        listenerCount = 0;
        for (var key in listeners) {
            eventCount++;
            listenerCount += listeners[key].length;
        }
        return listenerCount
    };

    var getEventCount = function() {
        return eventCount;
    };


    var asynchifySplice = function(listnrs, cb) {
        setTimeout(function() {
            spliceListener(listnrs, cb)
        }, 0)
    };

    var removeListener = function(event, callback) {




        if (!listeners[event.type]) {
            return;
        }

        if (listeners[event.type].indexOf(callback) == -1) {
        //    console.log("Listener already removed", event.type, callback)
            return;
        }

        asynchifySplice(listeners[event.type], callback);
    };


    return {
        getFiredCount:getFiredCount,
        getListenerCount:getListenerCount,
        getEventCount:getEventCount,
        removeListener:removeListener,
        on:registerListener,
        once:registerOnceListener,
        args:eventArgs,
        fire:fireEvent,
        list:list
    };

});