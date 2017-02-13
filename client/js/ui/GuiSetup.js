"use strict";


define([
        'Events',
        'ui/dom/DomPanel'
    ],
    function(
        evt,
        DomPanel
    ) {

        var rightPanel;
        var leftPanel;
        
        var GuiSetup = function() {
            this.active = true;
        };

        GuiSetup.prototype.initMainGui = function() {
            var parent = document.body;
            rightPanel = new DomPanel(parent, 'right_panel', true);
            leftPanel = new DomPanel(parent, 'left_panel', true);
        };

        GuiSetup.prototype.removeMainGui = function() {
            this.active = false;
            this.elements[this.config[0].id].removeElement();
            delete this;
        };

        GuiSetup.prototype.tickTextRenderer = function(tpf) {

        };


        return GuiSetup;

    });


