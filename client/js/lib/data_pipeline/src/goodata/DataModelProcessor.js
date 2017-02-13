define([
	'goo/math/MathUtils',
	'goo/math/Transform'
],
/** @lends  */
function(
	MathUtils,
	Transform
){

	/**
	 * @class
	 */
	function DataModelProcessor(){

	}

	/**
	 * Processes the Goo datamodel JSON structure before loading it into the loader. Note that the JSON object will be mutated.
	 * @param  {object} json
	 * @return {object}
	 */
	DataModelProcessor.process = function(json){
		return json;
	};

	/*

	// JSON:

	"components": {
		"collider": {
			"type": "Box",
			"options": {
				"axis": "x"|"y"|"z",
				"enabled": true|false,
				"halfExtents": [1,1,1],
				"height": 1,
				"mesh": "some.mesh"|null,
				"radius": 1
			}
		},
		"rigidBody": {
			"angularDamping": 0,
			"angularFactor": [1,1,1],
			"angularVelocity": [0,0,0],
			"enabled": true|false,
			"friction": 0,
			"linearDamping": 0,
			"linearFactor": [1,1,1],
			"linearVelocity": [0,0,0],
			"mass": 1,
			"restitution": 0,
			"type": "dynamic"|"kinematic",
		}
	}

	 */
	DataModelProcessor.processColliders = function(json){

		var addedComponent = false;

		var localTransforms = {};
		var worldTransforms = {};

		// Create and set local transforms
		for(var id in json){
			if(!('.entity' in id)) continue;

			var entity = json[id];

			var localTrans = localTransforms[id] = new Transform();
			worldTransforms[id] = new Transform();

			var config = entity.components.transform;

			// Translation
			localTrans.translation.setArray(config.translation);

			// Rotation
			localTrans.setRotationXYZ(
				MathUtils.DEG_TO_RAD * config.rotation[0],
				MathUtils.DEG_TO_RAD * config.rotation[1],
				MathUtils.DEG_TO_RAD * config.rotation[2]
			);

			// Scale
			localTrans.scale.setArray(config.scale);
		}

		// Compute world transforms
		// Reuse TransformSystem
		var mockEntities = Object.keys(localTransforms).map(function (id){
			return {
				transformComponent: {
					transform: localTransforms[id],
					worldTransform: worldTransforms[id],
					_dirty: true,
					parent: null // TODO
				}
			};
		});
		TransformSystem.prototype.process.call({}, mockEntities);

		// Add colliders
		for(var id in json){
			if(!('.entity' in id)) continue;

			var entity = json[id];
			if((entity.tags.collider || entity.tags.trigger) && entity.components.meshData){

				var scale = worldTransforms[id].scale;
				var collider;
				var md = entity.components.meshData;
				switch(md.shape){
					case 'Box':
						collider = {
							shape: "Box",
							halfExtents: [
								0.5 * scale[0],
								0.5 * scale[1],
								0.5 * scale[2]
							]
						};
						break;
					case 'Sphere':
						collider = {
							shape: "Sphere",
							radius: 0.5 * scale[0]
						};
						break;
					case 'Cylinder':
						collider = {
							shape: "Cylinder",
							radiusTop: 0.5 * scale[0],
							radiusBottom: 0.5 * scale[0],
							height: 1 * scale[2]
						};
						break;
					default:
						console.warn('Unhandled collider type: ' + entity.components.meshData.shape);
						break;
				}
			}
		}

		/*
		entity.traverse(function(descendant){
			if((descendant.hasTag('collider') || descendant.hasTag('trigger')) && descendant.hasComponent('MeshDataComponent')){
				var md = descendant.meshDataComponent.meshData;
				var scale = descendant.transformComponent.worldTransform.scale.data;
				var collider;
				if(md instanceof goo.Sphere){
					collider = new goo.CannonSphereColliderComponent({radius: md.radius * scale[0]});
				} else if(md instanceof goo.Box){
					collider = new goo.CannonBoxColliderComponent({
						halfExtents: new goo.Vector3(
							md.xExtent * scale[0],
							md.yExtent * scale[1],
							md.zExtent * scale[2]
						)
					});
				} else if(md instanceof goo.Cylinder){
					// The goo & cannon cylinders are both along Z. Nice!
					collider = new goo.CannonCylinderColliderComponent({
						radiusTop: md.radiusTop * scale[0],
						radiusBottom: md.radiusBottom * scale[0],
						height: md.height * scale[2],
						numSegments: md.radialSamples
					});
				} else if(md instanceof goo.Quad){
					collider = new goo.CannonPlaneColliderComponent();
				} else {
					console.error('Unknown collider shape');
					console.error(md);
					return;
				}
				descendant.setComponent(collider);
				if(descendant.hasTag('trigger'))
					collider.isTrigger = true;
				addedComponent = true;
			}
		});
		if(addedComponent){
			ctx.entity.setComponent(new goo.CannonRigidbodyComponent({
				mass: args.mass
			}));
			ctx.bodyStep = 0;
		}
		*/

		return json;
	};

	return DataModelProcessor;
});