"use strict";

define([
        'EffectsAPI',
    'Events'
    ],
    function(
        EffectsAPI,
        evt
    ) {

        var lastKeyValues = {
            PARTICLE_POOL:0,
            EFFECT_POOL:0,
            RENDERERS:0,
            EFFECTS:0,
            PARTICLES:0,
            FX_ADDS:0
        };

        var MonitorEffectAPI = function() {

        };

        var sends = {};

        var notifyStatus = function(value, dataKey) {

            if (value != lastKeyValues[dataKey]) {
                lastKeyValues[dataKey] = value;
                if (!sends[dataKey]) {
                    sends[dataKey] = {}

                }
                sends[dataKey][dataKey] = value;
                evt.fire(evt.list().MONITOR_STATUS, sends[dataKey]);
            }

        };

        MonitorEffectAPI.tickEffectMonitor = function() {

            notifyStatus(EffectsAPI.sampleTotalParticlePool(),       'PARTICLE_POOL');
            notifyStatus(EffectsAPI.sampleActiveRenderersCount(),    'RENDERERS');
            notifyStatus(EffectsAPI.countTotalEffectPool(),          'EFFECT_POOL');
            notifyStatus(EffectsAPI.sampleActiveEffectsCount(),      'EFFECTS');
            notifyStatus(EffectsAPI.sampleActiveParticleCount(),     'PARTICLES');
            notifyStatus(EffectsAPI.sampleEffectActivations(),       'FX_ADDS');

        };

        return MonitorEffectAPI;

    });