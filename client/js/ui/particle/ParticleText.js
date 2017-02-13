"use strict";


define([
        'Events',
        'PipelineAPI',
        'PipelineObject'
    ],
    function(
        evt,
        PipelineAPI,
        PipelineObject
    ) {

        var Vector3 = goo.Vector3;

        var particleConfigs = {};
        var textConfig = {};

        var letterConfig;

        var particleData =	{
            pos:new Vector3(0, 0, 0),
            vel:new Vector3(0, 0, 0)
        };

        var TextMessage = function(text, textStyle) {
            this.text = text+'';
            this.age = 0;
            this.effectData = textStyle.particleConfig;
            this.config = textConfig[textStyle.textConfig];
            this.posx = textStyle.posx;
            this.posy = textStyle.posy;
            this.size = textStyle.size;
            this.printCount = 0;
        };
        
        var ParticleText = function(simpleParticles) {

            this.simpleParticles = simpleParticles;

            this.simId = 'TextParticle';
            var _this = this;

            this.messages = [];

            var textConfPipe = new PipelineObject('effects', 'text_config');
            var textParticlePipe = new PipelineObject('effects', 'text_particles');

            function applyTextParticleConfigs() {
                particleConfigs = textParticlePipe.buildConfig('effect_data');
            }

            function applyTextConfigs() {
                textConfig = textConfPipe.buildConfig('config_data');
            }

            textConfPipe.subscribe(applyTextConfigs);
            textParticlePipe.subscribe(applyTextParticleConfigs);
            
            var drawText = function(e) {
                _this.writeText(evt.args(e).text, evt.args(e).textStyle);
            };

            evt.on(evt.list().PARTICLE_TEXT, drawText);

            var textTick = function(e) {
                _this.tickTextRenderer(evt.args(e).tpf);
            };

            evt.on(evt.list().CLIENT_TICK, textTick);
        };

        ParticleText.prototype.writeText = function(textString, textStyle) {
            this.messages.push(new TextMessage(textString, textStyle));
        };


        ParticleText.prototype.printNextMessageLetter = function(textMessage) {

            particleData.vel.setDirect(0, 1, 0);

            letterConfig = particleConfigs[textMessage.effectData];
            letterConfig.sprite = textMessage.text[textMessage.printCount];
            letterConfig.size[0] = textMessage.size*textMessage.config.size;
            letterConfig.size[1] = textMessage.size*textMessage.config.size;

            particleData.pos.setDirect(textMessage.text.length + textMessage.posx - textMessage.printCount * textMessage.config.spacing, 0, textMessage.posy);

            this.simpleParticles.spawn(this.simId, particleData.pos, particleData.vel, letterConfig, null, 1);
            textMessage.printCount++;
            if (textMessage.printCount >= textMessage.text.length) {
                this.messages.splice(this.messages.indexOf(textMessage), 1);
            }
            this.tickTextRenderer(0);

        };

        ParticleText.prototype.processMessageText = function(textMessage, tpf) {
            textMessage.age += tpf;
            if (textMessage.age > textMessage.config.writeSpeed * textMessage.printCount) {
                this.printNextMessageLetter(textMessage);
            }
        };


        ParticleText.prototype.tickTextRenderer = function(tpf) {
            for (var i = 0; i < this.messages.length; i++) {
                this.processMessageText(this.messages[i], tpf);
            }
        };


        return ParticleText;

    });


