define(["Events", "io/TouchActionListener"], function(event, touchListener) {

    var refDiv = document.getElementById("canvas_window");

    var getElementById = function(id) {
        return document.getElementById(id);
    };


    var removeDivElement = function(div) {
        if (div.parentNode) div.parentNode.removeChild(div);
    };

    var checkForStylePrefix = function(prefix) {
        if (refDiv.style[prefix] == "") return prefix;
    };

    var checkStylePrefixList = function(prefixes) {
        for (var i in prefixes) {
            var prefix = checkForStylePrefix(prefixes[i]);
            if (prefix) return prefix;
        }
    };


    var getTransformPrefix = function() {
        var prefixes = ["transform", "webkitTransform", "MozTransform", "msTransform", "OTransform"];
        return checkStylePrefixList(prefixes);
    };

    var getTransitionPrefix = function() {
        var prefixes = ["transition", "WebkitTransition", "MozTransition", "msTransition", "OTransition"];
        return checkStylePrefixList(prefixes);
    };

    var setDivElementParent = function(id, parentId) {
        var divId = document.getElementById(id);
        var parentDiv = document.getElementById(parentId);
        parentDiv.appendChild(divId)

    };

    var applyElementStyleParams = function(element, styleParams) {
        for(index in styleParams) {
            element.style[index] = styleParams[index];
        }
    };

    var removeElementStyleParams = function(element, styleParams) {
        for(index in styleParams) {
            element.style[index] = "";
        }
    };

    var addElementClass = function(element, styleClass) {
        element.classList.add(styleClass);
    };

    var removeElementClass = function(element, styleClass) {
        element.classList.remove(styleClass);
    };

    var setElementClass = function(element, styleClass) {
    //    setTimeout(function() {
            element.className = styleClass; //  "game_base "+styleClass;
    //    }, 0);
    };

    var createDivElement = function(parent, id, html, styleClass) {
        if (typeof(parent) == "string") parent = document.getElementById(parent);
        var newdiv = createElement(parent, id, 'div', html, styleClass);
        return newdiv;
    };

    var createCanvasElement = function(parentId, id, source, styleClass, loadedCallback) {
        var parent = document.getElementById(parentId);
        var canvas = createElement(parent, id, 'canvas', "", styleClass)
        var image = new Image()
        image.setAttribute('src', source);
        canvas.setAttribute('name', id);
        image.onload = function(){
            canvas.image = image;
            loadedCallback();
        };

        return canvas;
    };

    var createIframeElement = function(parentId, id, source, styleClass, loadedCallback) {
        var parent = document.getElementById(parentId);
        var iframe = createElement(parent, id, 'iframe', "", styleClass)
        iframe.setAttribute('src', source);
        iframe.setAttribute('name', id);
        iframe.onload = function(){
            loadedCallback();
        };

        return iframe;
    };

    var createElement = function(parent, id, type, html, styleClass) {
        var index = parent.getElementsByTagName("*");
        var elem = document.createElement(type, [index]);
        elem.setAttribute('id', id);
        elem.className = styleClass; // "game_base "+styleClass;

        if (html) {
            setElementHtml(elem, html)
        }

        parent.appendChild(elem);
        return elem;
    };


    var createTextInputElement = function(parent, id, varName, styleClass) {
        var index = parent.getElementsByTagName("*");
        var newdiv = document.createElement('input', [index]);

        newdiv.setAttribute('id', id);
        newdiv.setAttribute('type', "text");
        newdiv.setAttribute('name', varName);

        newdiv.className = styleClass;

        parent.appendChild(newdiv);
        return newdiv;
    };

    var setElementHtml = function(element, text) {
        if (typeof(element) == "string") element = getElementById(element);

        setTimeout(function() {
            element.innerHTML = text;
        },1)
    };

    var setElementBackgroundImg = function(element, url) {
        setTimeout(function() {
            element.style.backgroundImage = "url("+url+")";
        },1)
    };

    var applyElementTransform = function(element, transform, time) {
        if (!time) time = 0;
        var transformPrefix = getTransformPrefix();
 //       setTimeout(function() {
            element.style[transformPrefix] = transform;
 //       },time)
    };

    var setElementTransition = function(element, transition) {
        var transitionPrefix = getTransitionPrefix();
        element.style[transitionPrefix] = transition;
    };

    var removeElement = function(element) {
        removeElementChildren(element)
        removeDivElement(element);
    };

    var removeElementChildren = function(element) {
        if (element.childNodes )
        {
            while ( element.childNodes.length >= 1 )
            {
                element.removeChild(element.firstChild);
            }
        }
    };


    var addElementClickFunction = function(element, cFunc) {

        disableElementInteraction(element);
        element.interactionListeners = {};

        var inType = "click";

        if (touchListener.isTouch()) {
            inType = "touchClick";
            touchListener.registerClickableElement(element);
        }


        element.interactionListeners[inType] = {clickFunc:cFunc, isEnabled:false};
        registerInputSoundElement(element, inType, "UI_HOVER", "UI_ACTIVE", "UI_CLICK", "UI_OUT");
        enableElementInteraction(element);
    };

    var registerInputSoundElement = function(element, inType, hover, active, click, out) {
        var hoverFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[hover]});
        //    client.soundPlayer.playSound(hover);
        };
        var pressFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[active]});
        //    client.soundPlayer.playSound(active);
        };
        var outFunc = function() {
            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[out]});
         //   client.soundPlayer.playSound(out);
        };

        var clickFunc = function() {

            event.fireEvent(event.list().ONESHOT_SOUND, {soundData:event.sound()[click]});
        //    client.soundPlayer.playSound(click);
        };

        var inputModels = {
            click:{
                mouseover:hoverFunc,
                mousedown:pressFunc,
                mouseout:outFunc,
                mousedown:pressFunc,
                mouseup:outFunc,
                click:clickFunc
            },
            touchClick:{
                touchstart:pressFunc,
                touchcancel:outFunc,
                touchClick:clickFunc
            }
        };

        element.soundInteractionListeners = inputModels[inType];

        element.soundInteractionListeners[inType] = clickFunc;

        for (index in element.soundInteractionListeners) {
            element.addEventListener(index, element.soundInteractionListeners[index], false)
        }
    };

    var disableElementInteraction = function(element) {

        element.style.pointerEvents = "none";
        element.style.cursor = "";

        for (index in element.soundInteractionListeners) {
            element.removeEventListener(index, element.soundInteractionListeners[index], null);
        };


        for (index in element.interactionListeners) {

            if (element.interactionListeners[index].isEnabled == true) {
                element.removeEventListener(index, element.interactionListeners[index].clickFunc, false);
                element.interactionListeners[index].isEnabled = false;
            }
        }
    };

    var enableElementInteraction = function(element) {
        element.style.pointerEvents = "auto";
        element.style.cursor = "pointer";

        for (index in element.soundInteractionListeners) {
            element.addEventListener(index, element.soundInteractionListeners[index], null);
        };


        for (index in element.interactionListeners) {
            if (element.interactionListeners[index].isEnabled == false) {
                element.addEventListener(index, element.interactionListeners[index].clickFunc, false);
                element.interactionListeners[index].isEnabled = true;
            }
        }
    };

    var performifyAllElements = function() {
        return;
        var i,
            tags = document.getElementsByTagName("div"),
            total = tags.length;
        for ( i = 0; i < total; i++ ) {
            tags[i].style["webkitTransformStyle"] = "preserve-3d";
        }
    };

    var quickHideElement = function(element) {
        element.style.display = "none"
        element.style.visibility = "hidden"
        return;
        var device = "ios"
        //    var device = ""
    //    var device = "android"
        var transform = "rotate3d(0, 1, 0, 89.9deg) translate3d(0px, 0px, -100px)";

        switch (device) {
            case "ios":
                var transform = "translate3d(0px, 0px, -50px) scale3d(0.6, 0.1, 1) rotate3d(0, 1, 0, 89.5deg) ";
            break;
            case "android":
                var transform = "scale3d(1.1, 1.1, 1) rotate3d(0, 1, 0, 89.9deg) translate3d(0px, 0px, -100px)";
            break;
        }

        applyElementTransform(element, transform);
    };

    var quickShowElement = function(element) {
        element.style.display = "";
        //    var transform = "";
        element.style.visibility = "visible"
    //    applyElementTransform(element, transform);
    };

    return {
        createTextInputElement:createTextInputElement,
        quickHideElement:quickHideElement,
        quickShowElement:quickShowElement,
        applyElementStyleParams:applyElementStyleParams,
        performifyAllElements:performifyAllElements,
        setElementTransition:setElementTransition,
        applyElementTransform:applyElementTransform,
        addElementClass:addElementClass,
        removeElementClass:removeElementClass,
        setElementClass:setElementClass,
        createIframeElement:createIframeElement,
        createCanvasElement:createCanvasElement,
        getElementById:getElementById,
        removeElement:removeElement,
        createDivElement:createDivElement,
        addElementClickFunction:addElementClickFunction,
        disableElementInteraction:disableElementInteraction,
        enableElementInteraction:enableElementInteraction,
        setElementHtml:setElementHtml
    }

});