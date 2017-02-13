define([
	'goo/sound/AudioContext',
    'goo/loaders/DynamicLoader',
    'goo/entities/SystemBus'
    ],
    function(
	AudioContext,
    DynamicLoader,
    SystemBus
) {
    "use strict";

	    function SoundHandler() {}

	    var sounds = {};

	    // WebAudio context
	    var context;

	    // master gain node
	    var masterGain;

	    // master volume
	    var masterVolume = 1;

	    // if sound is muted
	    var soundMuted = false;

	    // if html document has focus
	    var hasFocus = true;

	    // DynamicLoader to load sounds
	    var loader;

	    // Queue for handling play requests before sounds are loaded, will start when ready.
	    var playQueue = {};

	    var loopStack = {};

	    // if webaudio is supported
	    var hasWebAudio = true;

	    SoundHandler.getMasterVolume = function(){
		    return masterVolume;
	    };

	    SoundHandler.init = function(gooRunner) {
			return
		    SoundHandler.useSounds = true;


		    if(window.AudioContext == null){
			    alert('WebAudio not supported.');
			    hasWebAudio = false;
			    return;
		    }

		    if (!context) {
			    // Only do thi once.
			    context = AudioContext;
			    masterGain = context.createGain();
			    masterGain.gain.value = 1;
			    // connect master gain
			    masterGain.connect(context.destination);
		    }

		    // listen for volume changed event
		    SystemBus.addListener('volume_changed', function(args) {
			    masterVolume = args.value;
			    console.log("Volume Changed")
			    if(soundMuted == true) return;
			    masterGain.gain.linearRampToValueAtTime(masterVolume, context.currentTime + 0.25)
		    });

		    // listen for mute event
		    SystemBus.addListener('volume_muted', function(args) {
			    soundMuted = args.value;
			    if(soundMuted == true)
				    masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.25)
			    else
				    masterGain.gain.linearRampToValueAtTime(masterVolume, context.currentTime + 0.25)
		    });

		    loader = new DynamicLoader({ world: gooRunner.world, rootPath: './' });

		    // fade out sounds when focus is lost
		    setInterval(function(){
			    if(soundMuted == true) return;

			    if(document.hasFocus()) {
				    if (hasFocus == false) {
					    hasFocus = true;
					    masterGain.gain.linearRampToValueAtTime(masterVolume, context.currentTime + 0.8)
				    }
			    }
			    else if(document.hasFocus() == false) {
				    if (hasFocus == true) {
					    hasFocus = false;
					    masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.8)
				    }
			    }
		    }, 200);

	    };

	    var registerSoundEffect = function(id, url, volume, loop, filter, spatial) {
		    if(url == '') return;
		    sounds[id] = "loading";

		    // if no webaudio use howler
		    if(hasWebAudio == false){
			    var urls = [url];
			    sounds[id] = new Howl({
				    urls: urls,
				    volume: volume,
				    buffer: false,
				    loop:loop
			    });
			    return;
		    }

		    // load sound
		    loader.load(url).then(function(data){

			    var createSound = function(buffer) {
				    console.log("sound :" + id + " has been loaded");

				    // store sound
				    sounds[id] = {
					    sources: {},
					    index: 0,
					    play: function(pos, vel){
						    var source = context.createBufferSource();
						    source.id = this.index++;
						    this.sources[source.id] = source;

						    // if sound ended remove it
						    source.onended = function(){

							    if (loopStack[id]) {
								    console.log("Loop ended in stack Stack:",id, source.id, loopStack);
								    delete loopStack[id][source.id];
							    }

							    delete this.sources[source.id];
						    }.bind(this);

						    source.loop = loop;
						    source.buffer = buffer;
						    // gain node for volume change



						    var gainNode = context.createGain();


						    // spatial sound
						    if(spatial === true){
							    // create a pannerNode for spatial sound
							    var panner = context.createPanner();
							    source.connect(panner);
							    panner.setPosition(pos.x, pos.y, pos.z);
							    panner.setVelocity(vel.x, vel.y, vel.z);
							    panner.refDistance = 15.0;
							    panner.connect(gainNode);
						    } else{
							    // connect source directly to gain when spatial sound is false
							    source.connect(gainNode);
						    }


							    var filterNode = context.createBiquadFilter();
							    gainNode.connect(filterNode);
							    if (typeof(filter) == 'object') {
							        filterNode.Q.value = filter.q;
							        filterNode.frequency.value = filter.f;
							    } else {
								    filterNode.Q.value = 1;
								    filterNode.frequency.value = 22000;
							    }
							    filterNode.connect(masterGain);

						    if (loop) {
							    if (!loopStack[id]) loopStack[id] = {};
							    loopStack[id][source.id] = {
								    sound:this,
								    source:source,
								    gain:gainNode.gain,
									panner:panner,
								    filter:filterNode
							    }
						    }

						    // connect node to masterGain node


						    gainNode.gain.value = volume;

						    // play sound
						    source.start(0);
					    },
					    stop: function(){
						    // stop all sources
						    for(var k in this.sources){
							    var source = this.sources[k];
							    source.stop(0);
							    source.onended();
						    }
						    // clear object
						    this.index = 0;
						    this.sources = {};
						    if (loopStack[id]) {
							    console.log("Loop ended in stack Stack:",id, loopStack);
							//    delete loopStack[id];
						    }
					    }
				    };
			    };

			    context.decodeAudioData(data, createSound, function () {
				    alert("Failed to decode the audio buffer.");
			    });

		    }).then(null,function(e){
				    alert("failed to load: " + e);
			    });
	    };

	    SoundHandler.setListenerData = function(pos, dir){
		    if(context) {
			    context.listener.setPosition(pos.x, pos.y, pos.z);
			    context.listener.setOrientation(dir.x, dir.y, dir.z, 0, 1, 0);
		    }
	    };

	    SoundHandler.registerAudioConfigs = function(configs) {
		    console.log("register audio configs:",configs);
		    for (var keys in configs) {
			    registerSoundEffect(
				    configs[keys].id,
				    configs[keys].url,
				    configs[keys].volume,
				    configs[keys].loop,
				    configs[keys].filter,
				    configs[keys].spatial
			    );
		    }
	    };

	    SoundHandler.startup = function() {
		    var useSounds = true;
		    if( localStorage['gooSoundEnabled'] == "false" ) useSounds = false;
		    SoundHandler.useSounds = useSounds;
		    SoundHandler.play('background');
	    };

	    SoundHandler.shutdown = function() {
		    SoundHandler.useSounds = false;
		    for (var sound in sounds) {
			    SoundHandler.stop(sound);
		    }
	    };

	    SoundHandler.toggleSound = function() {
		    if (SoundHandler.useSounds) {
			    SoundHandler.shutdown();
		    } else {
			    SoundHandler.startup();
		    }
	    };

	    SoundHandler.play = function(soundId, pos, vel) {
		    console.log("Play sound", soundId)
		    if (SoundHandler.useSounds) {
			    var sound = sounds[soundId];
			    // if sound is loading try to play it after a delay
			    // this might only be wanted for looping sounds
			    if(sound === "loading"){
				    playQueue[soundId] = {pos:pos, vel:vel};
				    setTimeout(function(){
					    if (playQueue[soundId]) {
						    SoundHandler.play(soundId, playQueue[soundId].pos, playQueue[soundId].vel);
					    }

				    },250);
			    }
			    // play sound
			    else if (sound) {
				    if(hasWebAudio)
					    sound.play(pos, vel);
				    else
					    sound.play();
			    }
		    }
	    };

	    SoundHandler.stop = function(soundId) {
		    var sound = sounds[soundId];
		    console.log("Stop SoundId: ", soundId, sound);
		    if (sound) {
			    if (typeof(sound.stop) == 'function') {
				    sound.stop();
			    }
		    }

		    if (playQueue[soundId]) {
			    delete playQueue[soundId];
		    }
	    };

	    SoundHandler.updateSound = function(soundId, pos, vel, effectData) {
		    var loop = loopStack[soundId];

		    if (playQueue[soundId]) {
			    console.log("Loop is in queue...: ", soundId);
			    return;
		    }
		    var activeLoopsWithId = 0;
		    if (loop) {
			    var time = 0.05;
			    if (effectData.time) time = effectData.time;
			    for (var key in loop) {
				    activeLoopsWithId +=1;
				    if (loop[key].panner) {
					    loop[key].panner.setPosition(pos.x, pos.y, pos.z);
					    loop[key].panner.setVelocity(vel.x, vel.y, vel.z);
				    }
					if (effectData.pitch) {
						loop[key].source.playbackRate.linearRampToValueAtTime(effectData.pitch, context.currentTime + time);
					}
				    if (effectData.frequency) {
					    loop[key].filter.frequency.linearRampToValueAtTime(effectData.frequency, context.currentTime + time);
				    }
				    if (effectData.Q) {
					    loop[key].filter.Q.linearRampToValueAtTime(effectData.Q, context.currentTime + time);
				    }
				    if (effectData.volume) {
					    loop[key].gain.linearRampToValueAtTime(effectData.volume, context.currentTime + time);
				    }
			    }
			    if (activeLoopsWithId > 1) console.log("More than 1 loop active", soundId, loop)
		    }
	    };

	    SoundHandler.stopAllLoops= function() {

		    for (var key in loopStack) {
				SoundHandler.stop(key);
		    }

	    };

	    SoundHandler.update = function(tpf, camera) {


		    var pos = camera.translation;
		    var dir = camera._up;
		    SoundHandler.setListenerData(pos, dir);
	    };

    return SoundHandler;
});