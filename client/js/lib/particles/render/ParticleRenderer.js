define([

],

function (

) {
	"use strict";

	var MeshData = goo.MeshData;
	var Shader = goo.Shader;
	var Material = goo.Material;
	var MeshRendererComponent = goo.MeshRendererComponent;
	var ShaderBuilder = goo.ShaderBuilder;
	
	function ParticleRenderer() {
		this.settings = null;
		this.entity = null;
		this.meshData = null;
		this.sprites = {};
	}

	ParticleRenderer.prototype.init = function (goo, simConf, settings, spriteAtlas, texture) {

		this.settings = settings;
		this.atlasConf = spriteAtlas;

		for (var i = 0; i < this.atlasConf.sprites.length; i++) {
			this.sprites[this.atlasConf.sprites[i].id] = this.atlasConf.sprites[i];
		}

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		attributeMap.DATA = MeshData.createAttribute(2, 'Float');
		attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
		attributeMap.TILE = MeshData.createAttribute(4, 'Float');
		var meshData = new MeshData(attributeMap, simConf.poolCount * 4, simConf.poolCount * 6);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		if (this.settings.billboardType) {
			var bbt = this.settings.billboardType
			particleShader.processors = [
				function (shader, shaderInfo) {
					shader.defines.BILLBOARD_TYPE = bbt;
				}
			]
		} else {
			particleShader.processors = [
				function (shader, shaderInfo) {
					shader.defines.BILLBOARD_TYPE = 0;
				}
			]
		}

		if (simConf.blending.value == "NoBlending") {
			var material = new Material(particleShader);
		} else {
			var material = new Material(particleShader);
		}

		material.uniforms.alphakill = simConf.alphakill.value;
		material.blendState.blending = simConf.blending.value;

		if (material.blendState.blending == "NoBlending") {
			material.depthState.write = true;
			material.renderQueue = 810;
		} else {
			material.depthState.write = false;
			material.renderQueue = 3010;
		}





		var entity = this.entity = goo.world.createEntity(meshData);
		entity.set(new MeshRendererComponent(material));
		entity.name = 'ParticleRenderer';
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		material.setTexture('PARTICLE_MAP', texture);

		var offset = this.meshData.getAttributeBuffer('OFFSET');
		var tile = this.meshData.getAttributeBuffer('TILE');
		var indices = this.meshData.getIndexBuffer();
		for (i = 0; i < simConf.poolCount; i++) {
			offset[8 * i + 0] = -1;
			offset[8 * i + 1] = -1;

			offset[8 * i + 2] = -1;
			offset[8 * i + 3] = 1;

			offset[8 * i + 4] = 1;
			offset[8 * i + 5] = 1;

			offset[8 * i + 6] = 1;
			offset[8 * i + 7] = -1;

			for (var j = 0; j < 4; j++) {
				tile[16 * i + j * 4 + 0] = 0; //offset u
				tile[16 * i + j * 4 + 1] = 0; //offset w
				tile[16 * i + j * 4 + 2] = 1; //scale u
				tile[16 * i + j * 4 + 3] = 1; //scale w
			}

			indices[6 * i + 0] = 4 * i + 0;
			indices[6 * i + 1] = 4 * i + 3;
			indices[6 * i + 2] = 4 * i + 1;
			indices[6 * i + 3] = 4 * i + 1;
			indices[6 * i + 4] = 4 * i + 3;
			indices[6 * i + 5] = 4 * i + 2;
		}
	};

	ParticleRenderer.prototype.rebuild = function () {
		if (this.settings.textureUrl.valueLoaded) {
			this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
		}
	};

	ParticleRenderer.prototype.remove = function () {
		this.entity.removeFromWorld();
	};

	ParticleRenderer.prototype.setVisible = function (visible) {
		this.entity.meshRendererComponent.hidden = !visible;
		this.entity.hidden = !visible;

		if (visible) {
			this.entity.addToWorld();
		} else {
			this.entity.removeFromWorld();
		}

	};

	ParticleRenderer.prototype.died = function (particle) {
		var data = this.meshData.getAttributeBuffer('DATA');

		for (var j = 0; j < 4; j++) {
			data[(4 * 2 * particle.index + 0) + 2 * j] = 0;
		}
	};

	ParticleRenderer.prototype.initFrame = function () {

		this.pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		this.col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		this.data = this.meshData.getAttributeBuffer('DATA');
		this.tile = this.meshData.getAttributeBuffer('TILE');



		this.tileInfo = this.settings.tile;
	//	this.isTiled = this.tileInfo !== undefined && this.tileInfo.enabled.value;
		this.tileCountX = this.atlasConf.textureUrl.tilesX;
		this.tileCountY = this.atlasConf.textureUrl.tilesY;
		this.loopScale = 1;
	//	if (this.isTiled) {
	//		this.tileCountX = this.tileInfo.tileCountX.value;
	//		this.tileCountY = this.tileInfo.tileCountY.value;
	//		this.loopScale  = this.tileInfo.loopScale.value;
	//	}
		this.scaleX = 1 / this.tileCountX;
		this.scaleY = 1 / this.tileCountY;
	//	this.totalTileCount = this.tileCountX * this.tileCountY;
	//	this.tileFrameCount = this.totalTileCount;
	//	if (this.isTiled && this.tileInfo.frameCount) {
	//		this.tileFrameCount = this.tileInfo.frameCount;
	//	}

		this.lastAlive = 0;

	};

	var j, i, l;

	ParticleRenderer.prototype.updateParticleTileBuffer = function (particle) {
		for (j = 0; j < 4; j++) {
			this.tile[(4 * 4 * i    ) + 4 * j] = particle.offsetX;
			this.tile[(4 * 4 * i + 1) + 4 * j] = particle.offsetY;
			this.tile[(4 * 4 * i + 2) + 4 * j] = particle.scaleX;
			this.tile[(4 * 4 * i + 3) + 4 * j] = particle.scaleY;
		}
	};

	ParticleRenderer.prototype.updateParticleColorBuffer = function (particle) {
        var coldata = particle.color;
		for (j = 0; j < 4; j++) {
            this.col[(4 * 4 * i    ) + 4 * j] = coldata.x;
            this.col[(4 * 4 * i + 1) + 4 * j] = coldata.y;
            this.col[(4 * 4 * i + 2) + 4 * j] = coldata.z;
            this.col[(4 * 4 * i + 3) + 4 * j] = coldata.w;
		}
	};

    ParticleRenderer.prototype.updateParticlePositionBuffer = function (particle) {
        var posdata = particle.position;
        for (j = 0; j < 4; j++) {
            this.pos[(4 * 3 * i    ) + 3 * j] = posdata.x;
            this.pos[(4 * 3 * i + 1) + 3 * j] = posdata.y;
            this.pos[(4 * 3 * i + 2) + 3 * j] = posdata.z;
        }
    };

    ParticleRenderer.prototype.updateParticleDataBuffer = function (particle) {
        for (j = 0; j < 4; j++) {
            this.data[(4 * 2 * i    ) + 2 * j] = particle.size;
            this.data[(4 * 2 * i + 1) + 2 * j] = particle.rotation;
        }
    };

    ParticleRenderer.prototype.updateParticleBufferData = function (tpf, particle) {

		i = this.renderedCount;

		particle.setTileInfo(this.sprites[particle.sprite], this.scaleX, this.scaleY);
		particle.updateAtlasOffsets();
		//	if (this.isTiled) {

		this.updateParticleTileBuffer(particle);
        this.updateParticleColorBuffer(particle);
        this.updateParticlePositionBuffer(particle);
        this.updateParticleDataBuffer(particle);

		this.lastAlive = i + 1;
	};

	ParticleRenderer.prototype.updateParticle = function (tpf, particle) {
		if (!this.renderedCount) {
			 this.initFrame();
		}

		this.renderedCount++;

		if (particle.dead) {
			return;
		}

		this.updateParticleBufferData(tpf, particle);
	};

	ParticleRenderer.prototype.updateMeshdata = function () {
		if (this.entity.hidden) {
			return;
		}

		this.meshData.indexLengths = [this.lastAlive * 6];
		this.meshData.indexCount = this.lastAlive * 6;
		this.renderedCount = 0;
		this.meshData.setVertexDataUpdated();
	};



	var particleShader = {
		processors: [
			function (shader, shaderInfo) {
				shader.defines.BILLBOARD_TYPE = shaderInfo.xxx || 0;
			}
		],
		defines: {
			SPIN: true,
			BILLBOARD_TYPE: 0
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexData: 'DATA',
			vertexOffset: 'OFFSET',
			textureTile: 'TILE'
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			cameraPosition: Shader.CAMERA,
			alphakill: 0,
			upVec: [0, 0, 1],
			dirVec: [0, 1, 0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec2 vertexData;',
			'attribute vec2 vertexOffset;',
			'attribute vec4 textureTile;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'#if BILLBOARD_TYPE == 1',
			'uniform vec3 cameraPosition;',
			'#elif BILLBOARD_TYPE == 2',
			'uniform vec3 upVec;',
			'uniform vec3 dirVec;',
			'#endif',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void) {',
			'color = vertexColor;',
			'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',

			'#ifdef SPIN',
			'float rotation = vertexData.y;',
			'float c = cos(rotation); float s = sin(rotation);',
			'mat3 spinMatrix = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);',
			'vec2 offset = (spinMatrix * vec3(vertexOffset, 1.0)).xy * vertexData.x;',
			'#else',
			'vec2 offset = vertexOffset * vertexData.x;',
			'#endif',

			'#if BILLBOARD_TYPE == 0', // camera facing
			'gl_Position = viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
			'gl_Position.xy += offset;',
			'#elif BILLBOARD_TYPE == 1', // locked in y-axis
			'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',

			'vec3 dirVec = cameraPosition - worldPos;',
			'dirVec.y = 0.0;',
			'dirVec = normalize(dirVec);',
			'vec3 upVec = vec3(0.0, 1.0, 0.0);',
			'vec3 leftVec = cross(upVec, dirVec) * offset.x;',

			'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
			'#elif BILLBOARD_TYPE == 2', // facing dirVec (with up)
			'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',
			'vec3 leftVec = cross(upVec, dirVec) * offset.x;',
			'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
			'#endif',

			'gl_Position = projectionMatrix * gl_Position;',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform float alphakill;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void)',
			'{',
			'vec4 col = color * texture2D(particleMap, coords);',
			'if (col.a <= alphakill) discard;',
			'gl_FragColor = col;',
			'}'
		].join('\n')
	};



	var vegetationShader = {
		processors: [
			ShaderBuilder.light.processor,
			function (shader) {
				if (ShaderBuilder.USE_FOG) {
					shader.defines.FOG = true;
					shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
					shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
				} else {
					delete shader.defines.FOG;
				}
			}
		],
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL,
			vertexUV0 : MeshData.TEXCOORD0,
			vertexColor : MeshData.COLOR,
			base : 'BASE'
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP,
			discardThreshold: -0.01,
			fogSettings: function () {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function () {
				return ShaderBuilder.FOG_COLOR;
			},
			time : Shader.TIME,
			fadeDistMin : 40.0,
			fadeDistMax : 50.0
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
				'attribute vec3 vertexPosition;',
				'attribute vec3 vertexNormal;',
				'attribute vec2 vertexUV0;',
				'attribute vec4 vertexColor;',
				'attribute float base;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform float time;',
				'uniform float fadeDistMin;',
				'uniform float fadeDistMax;',

				ShaderBuilder.light.prevertex,

				'varying vec3 normal;',
				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec2 texCoord0;',
				'varying vec4 color;',
				'varying float dist;',

				'void main(void) {',
				'vec3 swayPos = vertexPosition;',
				'swayPos.x += sin(time * 1.0 + swayPos.x * 0.5) * base * sin(time * 1.8 + swayPos.y * 0.6) * 0.1 + 0.08;',
				'vec4 worldPos = worldMatrix * vec4(swayPos, 1.0);',
				'vWorldPos = worldPos.xyz;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				ShaderBuilder.light.vertex,

				'normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
				'texCoord0 = vertexUV0;',
				'color = vertexColor;',
				'viewPosition = cameraPosition - worldPos.xyz;',
				'dist = 1.0 - smoothstep(fadeDistMin, fadeDistMax, length(viewPosition.xz));',
				'}'
			].join('\n');
		},
		fshader: function () {
			return [
				'uniform sampler2D diffuseMap;',
				'uniform float discardThreshold;',
				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',

				ShaderBuilder.light.prefragment,

				'varying vec3 normal;',
				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec2 texCoord0;',
				'varying float dist;',
				'varying vec4 color;',

				'void main(void)',
				'{',
				'vec4 final_color = texture2D(diffuseMap, texCoord0) * color;',
				'if (final_color.a < discardThreshold) discard;',
				'final_color.a = min(final_color.a, dist);',
				'if (final_color.a <= 0.0) discard;',

				'vec3 N = normalize(normal);',

				ShaderBuilder.light.fragment,

				'final_color.a = pow(final_color.a, 0.5);',

				'#ifdef FOG',
				'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
				'final_color.rgb = mix(final_color.rgb, fogColor, d);',
				'#endif',

				'gl_FragColor = final_color;',
				'}'
			].join('\n');
		}
	};

	return ParticleRenderer;
});