define({
	"simulators":[
		
		{
			"id": "AdditiveParticleAndTrail",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"TrailRenderer"
			],
			"poolCount": 50,
			"blending": {
				"value": "AdditiveBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.01,
				"type": "number",
				"min": 0.0,
				"max": 1.0

			}
		},
	
		{
			"id": "AdditiveParticle",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"ParticleRenderer"
			],
			"poolCount": 200,
			"blending": {
				"value": "AdditiveBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.01,
				"type": "number",
				"min": 0.05,
				"max": 1.0

			}
		},
		{
			"id": "StandardParticle",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"ParticleRenderer"
			],
			"poolCount": 150,
			"blending": {
				"value": "CustomBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.01,
				"type": "number",
				"min": 0.0,
				"max": 1.0

			}
		},
		{
			"id": "OpaqueParticle",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"ParticleRenderer"
			],
			"poolCount": 450,
			"blending": {
				"value": "NoBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.3,
				"type": "number",
				"min": 0.0,
				"max": 1.0

			}
		},
		/*
		{
			"id": "SurfaceParticle",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"SurfaceRenderer"
			],
			"poolCount": 50,
			"blending": {
				"value": "CustomBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.1,
				"type": "number",
				"min": 0.0,
				"max": 1.0

			}
		},
		*/
		{
			"id": "FastAdditiveTrail",
			"atlas":"defaultSpriteAtlas",
			"renderers": [
				"FastTrailRenderer"
			],
			"poolCount": 50,
			"blending": {
				"value": "AdditiveBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0.01,
				"type": "number",
				"min": 0.0,
				"max": 1.0

			}
		}
	]
});