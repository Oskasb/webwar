define({
	"simulators":[
		{
			"id": "TextParticle",
			"atlas":"fontSpriteAtlas",
			"renderers": [
				"FontRenderer"
			],
			"poolCount": 200,
			"blending": {
				"value": "CustomBlending",
				"type": "option",
				"values": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"],
				"texts": ["AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "NoBlending", "CustomBlending"]
			},
			"alphakill": {
				"value": 0,
				"type": "number",
				"min": 0.0,
				"max": 1.0
			}
		}
	]
});