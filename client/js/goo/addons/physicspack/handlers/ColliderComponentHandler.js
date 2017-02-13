define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/PhysicsMaterial'
], function (
	ComponentHandler,
	ColliderComponent,
	BoundingBox,
	ShapeCreatorMemoized,
	RSVP,
	_,
	SphereCollider,
	BoxCollider,
	PlaneCollider,
	CylinderCollider,
	PhysicsMaterial
) {
	'use strict';

	/**
	 * For handling loading of collider components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function ColliderComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ColliderComponent';
	}

	ColliderComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ColliderComponentHandler.prototype.constructor = ColliderComponentHandler;
	ComponentHandler._registerClass('collider', ColliderComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	ColliderComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
			shape: 'Box',
			shapeOptions: {
				halfExtents: [1, 1, 1],
				radius: 0.5,
				height: 1
			},
			isTrigger: false,
			friction: 0.3,
			restitution: 0.0
		});
	};

	/**
	 * Create collider component.
	 * @returns {ColliderComponent} the created component object
	 * @private
	 */
	ColliderComponentHandler.prototype._create = function () {
		return new ColliderComponent({ material: new PhysicsMaterial() });
	};

	/**
	 * Removes the collider component
	 * @param {string} ref
	 */
	ColliderComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('ColliderComponent');
	};

	/**
	 * Update engine collider component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	ColliderComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			switch (config.shape) {
			default:
			case 'Box':
				component.collider = new BoxCollider(config.shapeOptions);
				component.worldCollider = new BoxCollider();
				break;
			case 'Sphere':
				component.collider = new SphereCollider(config.shapeOptions);
				component.worldCollider = new SphereCollider();
				break;
			case 'Plane':
				component.collider = new PlaneCollider();
				component.worldCollider = new PlaneCollider();
				break;
			case 'Cylinder':
				component.collider = new CylinderCollider(config.shapeOptions);
				component.worldCollider = new CylinderCollider();
				break;
			}

			component.material.friction = config.friction;
			component.material.restitution = config.restitution;
			component.isTrigger = config.isTrigger;
			component.setToDirty();

			entity.traverseUp(function (entity) {
				if (entity.rigidBodyComponent) {
					entity.rigidBodyComponent.initialize();
					entity.rigidBodyComponent.setToDirty();
				}
			});

			return component;
		});
	};

	return ColliderComponentHandler;
});
