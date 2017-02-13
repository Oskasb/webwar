define([

],

function (

) {
	"use strict";

	var Vector3 = goo.Vector3; 
	var Vector4 = goo.Vector4; 
	
	var defaultColorCurve = [[0, 1], [1, 0]];
    var defaultAlphaCurve = [[0, 1], [1, 0]];
    var defaultGrowthCurve =[[0, 1], [1, 1]];
    var defaultSpinCurve =  [[0, 0], [1, 0]];

	function Particle(idx) {
		this.calcVec = new Vector3();
		this.upVector = new Vector3();
		this.index = idx;
		this.position 	= new Vector3();
		this.direction  = new Vector3();
		this.velocity 	= new Vector3();
		this.color 		= new Vector4();
		this.color0 	= new Vector3();
		this.color1 	= new Vector3();

        this.colorBlend = 0;
        this.colorCurve = defaultColorCurve;

        this.opacity = 1;
        this.alpha = defaultAlphaCurve;

        this.size = 1;
        this.growthFactor = 1;
        this.growth = defaultGrowthCurve;

        this.acceleration = 1;
        this.gravity = 0;
        this.rotation = 0;
        this.spinspeed = 0;
        this.spin = defaultSpinCurve;

        this.lifeSpan = 0;
        this.lifeSpanTotal = 0;
        this.progress = 0;
        this.frameOffset = 0;
        this.frameCount = 0;

        this.tileIndex = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.dead = true;
        this.requestKill = false;

		this.id = Particle.ID++;
		this.reset();
	}

	Particle.ID = 0;

	Particle.prototype.reset = function () {
		this.position.setDirect(0, 0, 0);
		this.velocity.setDirect(0, 0, 0);
		this.color.setDirect(1, 1, 1, 1);
		this.color0.setDirect(1, 1, 1);
		this.color1.setDirect(1, 1, 1);

		this.upVector.setDirect(0, 1, 0);

		this.colorBlend = 0;
		this.colorCurve = defaultColorCurve;

		this.opacity = 1;
		this.alpha = defaultAlphaCurve;

		this.size = 1;
		this.growthFactor = 1;
		this.growth = defaultGrowthCurve;

		this.acceleration = 1;
		this.gravity = 0;
		this.rotation = 0;
		this.spinspeed = 0;
		this.spin = defaultSpinCurve;

		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.progress = 0;
		this.frameOffset = 0;
		this.frameCount = 0;

		this.tileIndex = 0;
		this.offsetX = 0;
		this.offsetY = 0;

		this.dead = true;
		this.requestKill = false;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}


	Particle.prototype.setParticleVectors = function (simD, simParams, ratio) {
		this.direction.setDirect(
			(Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.x,
			(Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.y,
			(Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.z
		);

		this.direction.normalize();

		this.velocity.setDirect(
			simD.strength*this.direction.x,
			simD.strength*this.direction.y,
			simD.strength*this.direction.z
		);

		this.position.setDirect(
			simParams.position.x + this.velocity.x * simD.stretch * ratio,
			simParams.position.y + this.velocity.y * simD.stretch * ratio,
			simParams.position.z + this.velocity.z * simD.stretch * ratio
		);

	};

	Particle.prototype.setParticleColors = function (simD) {

		this.color1.setArray(simD.color1);

		this.color0.setDirect(
			simD.color0[0] *(1-simD.colorRandom)+simD.colorRandom*Math.random(),
			simD.color0[1] *(1-simD.colorRandom)+simD.colorRandom*Math.random(),
			simD.color0[2] *(1-simD.colorRandom)+simD.colorRandom*Math.random()
		);

		this.color.x = this.color0.x;
		this.color.y = this.color0.y;
		this.color.z = this.color0.z;
	};

	Particle.prototype.joinSimulation = function (simParams, ratio) {
		var simD = simParams.data;

		this.setParticleVectors(simD, simParams, ratio);
		this.setParticleColors(simD);

		this.sprite = simD.sprite;
		this.trailSprite = simD.trailsprite;
		this.trailWidth = simD.trailwidth;
		this.loopcount = simD.loopcount;

		this.colorCurve = simD.colorCurve;
		this.opacity = randomBetween(simD.opacity[0], simD.opacity[1]);
		this.alpha = simD.alpha;

		if (simD.size.length) {
			this.size = randomBetween(simD.size[0], simD.size[1]);
		} else {
			this.size = simD.size;
		}


		this.growthFactor = randomBetween(simD.growthFactor[0], simD.growthFactor[1]);
		this.growth = simD.growth;

		this.spin = simD.spin;
		this.spinspeed = randomBetween(simD.spinspeed[0], simD.spinspeed[1]);
		this.rotation = randomBetween(simD.rotation[0], simD.rotation[1]);

		this.acceleration = simD.acceleration;
		this.gravity = simD.gravity;

		this.progress = 0;
		this.lifeSpan = randomBetween(simD.lifespan[0], simD.lifespan[1]);
		this.lifeSpanTotal = this.lifeSpan;

		this.frameOffset = ratio;

		this.dead = false;
	};

	Particle.prototype.setTileInfo = function (tileInfo, scaleX, scaleY) {
		this.tileInfo = tileInfo;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	};

	Particle.prototype.setTrailInfo = function (trailInfo, trailScaleX, trailScaleY) {
		this.trailInfo = trailInfo;
		this.trailScaleX = trailScaleX;
		this.trailScaleY = trailScaleY;
		this.trailOffsetX = this.trailScaleX * this.trailInfo.tiles[0][0];
		this.trailOffsetY = 1 - this.trailScaleY * (this.trailInfo.tiles[0][1]+1);
	};


	Particle.prototype.setTileIndex = function(idx) {
		this.tileIndex = idx; // Math.floor(this.tileInfo.tiles.length * this.progress * this.loopcount) % this.tileInfo.tiles.length;
	};

	Particle.prototype.selectAnimationFrame = function() {
		this.tileIndex = Math.floor(this.tileInfo.tiles.length * this.progress * this.loopcount) % this.tileInfo.tiles.length;
	};

	Particle.prototype.updateAtlasOffsets = function() {
		if (this.tileInfo.tiles.length > 1) {
			this.selectAnimationFrame();
		}
		this.offsetX = this.scaleX * this.tileInfo.tiles[this.tileIndex][0];
		this.offsetY = 1 - this.scaleY * (this.tileInfo.tiles[this.tileIndex][1]+1);
	};

	Particle.prototype.setDataUsage = function () {
	};


	Particle.prototype.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
		return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
	};

	Particle.prototype.valueFromCurve = function(value, curve) {
		for (var i = 0; i < curve.length; i++) {
			if (!curve[i+1]) return 0;
			if (curve[i+1][0] > value) return this.getInterpolatedInCurveAboveIndex(value, curve, i)
		}
		return 0;
	};

	Particle.prototype.applyParticleCurves = function(deduct) {
		this.size += this.growthFactor * this.valueFromCurve(this.progress, this.growth) * deduct;
		this.rotation += this.spinspeed * this.valueFromCurve(this.progress, this.spin) * deduct;
		this.color.w = this.opacity * this.valueFromCurve(this.progress, this.alpha);

		this.colorBlend = this.valueFromCurve(this.progress, this.colorCurve);
		this.color.x = this.color0.x *this.colorBlend + this.color1.x * (1-this.colorBlend);
		this.color.y = this.color0.y *this.colorBlend + this.color1.y * (1-this.colorBlend);
		this.color.z = this.color0.z *this.colorBlend + this.color1.z * (1-this.colorBlend);
	};

	Particle.prototype.defaultParticleUpdate = function(deduct) {
		this.progress = 1-((this.lifeSpan - this.frameOffset*0.016)  / this.lifeSpanTotal);

		this.applyParticleCurves(deduct);

		if (isNaN(this.velocity.x)) {
			console.log("Nan velocity");
			this.velocity.setDirect(0, 0, 0);
		}

		this.velocity.mulDirect(this.acceleration, this.acceleration, this.acceleration);
		this.velocity.addDirect(this.upVector.x*this.gravity*deduct, this.upVector.y*this.gravity*deduct, this.upVector.z*this.gravity*deduct);

		this.calcVec.set(this.velocity);
		this.calcVec.mulDirect(deduct, deduct, deduct);
		if (isNaN(this.calcVec.x)) {
			console.log("Nan particle");
			return;
		}
		this.position.add(this.calcVec);
	};


	Particle.prototype.killParticle = function () {
		this.requestKill = true;
	};


	return Particle;
});