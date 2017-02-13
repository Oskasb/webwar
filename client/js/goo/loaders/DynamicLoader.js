define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/handlers/ComponentHandler',
	'goo/util/Ajax',
	'goo/util/rsvp',
	'goo/util/StringUtil',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil',
	'goo/util/ShapeCreatorMemoized',

	'goo/loaders/handlers/CameraComponentHandler',
	'goo/loaders/handlers/EntityHandler',
	'goo/loaders/handlers/LightComponentHandler',
	'goo/loaders/handlers/MaterialHandler',
	'goo/loaders/handlers/MeshDataComponentHandler',
	'goo/loaders/handlers/MeshDataHandler',
	'goo/loaders/handlers/MeshRendererComponentHandler',
	'goo/loaders/handlers/SceneHandler',
	'goo/loaders/handlers/ShaderHandler',
	'goo/loaders/handlers/TextureHandler',
	'goo/loaders/handlers/TransformComponentHandler',
	'goo/loaders/handlers/ProjectHandler',
	'goo/loaders/handlers/SoundComponentHandler',
	'goo/loaders/handlers/SoundHandler',
	'goo/loaders/handlers/EnvironmentHandler',
	'goo/loaders/handlers/SkyboxHandler',
	'goo/loaders/handlers/HtmlComponentHandler'
], function (
	ConfigHandler,
	ComponentHandler,
	Ajax,
	RSVP,
	StringUtil,
	PromiseUtil,
	ArrayUtil,
	ShapeCreatorMemoized
) {
	/*jshint eqeqeq: false, -W041, -W099 */
	'use strict';

	/**
	 * Class to load objects into the engine, or to update objects based on the data model.
	 * @param {object} options
	 * @param {World} options.world The target World object.
	 * @param {string} options.rootPath The root path from where to get resources.
	 * @param {Ajax} [options.ajax=new Ajax(options.rootPath)]
	 * Can be used to overwrite how the loader fetches refs. Good for testing.
	 */
	function DynamicLoader(options) {
		if (options.world) {
			this._world = options.world;
		} else {
			throw new Error('World argument cannot be null');
		}

		if (options.ajax) {
			this._ajax = options.ajax;
		} else if (options.rootPath) {
			this._ajax = new Ajax(options.rootPath);
		} else {
			throw new Error('ajax or rootPath must be defined');
		}

		// Will hold the engine objects
		this._objects = new Map();
		// Will hold instances of handler classes by type
		this._handlers = {};
	}

	/**
	 * Load configs into the loader cache without loading anything into the engine.
	 * Subsequent calls to load and update will draw configs from the prefilled cache.
	 *
	 * @param {object} configs Configs object. Keys should be refs, and values are the config objects. If a config is null,
	 * the loader will search for the appropriate config in the loader's internal cache.
	 * @param {boolean} [clear=false] If true, possible previous cache will be cleared. Otherwise the existing cache is extended.
	 *
	 **/
	DynamicLoader.prototype.preload = function (bundle, clear) {
		this._ajax.prefill(bundle, clear);
	};

	/**
	 * Clears the cache of all the handlers. Also clears the engine.
	 * @returns {RSVP.Promise} Promise resolves when handlers are cleared.
	 */
	DynamicLoader.prototype.clear = function () {
		var promises = [];
		for (var type in this._handlers) {
			promises.push(this._handlers[type].clear());
		}
		if (this._ajax.clear instanceof Function) {
			this._ajax.clear();
		}
		if (this._world && this._world.gooRunner) {
			ShapeCreatorMemoized.clearCache(this._world.gooRunner.renderer.context);
			for (var i = 0; i < this._world.gooRunner.renderSystems.length; i++) {
				var lights = this._world.gooRunner.renderSystems[i].lights;
				if (lights) {
					for (var j = 0; j < lights.length; j++) {
						lights[j].destroy(this._world.gooRunner.renderer);
					}
				}
			}

			this._world.gooRunner.renderer.clearShaderCache();
		}
		return RSVP.all(promises);
	};

	/**
	 * Load an object with the specified path into the engine. The object can be of any
	 * type, what loading does is determined by the ref type and the
	 * registered {@link ConfigHandler}.
	 *
	 * @param {string} ref Ref of object to load.
	 * @param {object} options
	 * @param {function(handled, total)} [options.progressCallback] Function called while loading the world.
	 * Arguments handled and total are both integer numbers and represent the loaded elements so far as well as the total elements.
	 * @param {boolean} [options.preloadBinaries=false] Load the binary data as soon as the reference is loaded.
	 * @param {boolean} [options.noCache=false] Ignore cache, i.e. always load files fresh from the server.
	 * @returns {RSVP.Promise} The promise is resolved when the object is loaded into the world. The parameter is an object
	 * mapping all loaded refs to their configuration, like so: <code>{sceneRef: sceneConfig, entity1Ref: entityConfig...}</code>.
	 */
	DynamicLoader.prototype.load = function (ref, options) {
		options = options || {};
		var load = this._loadObject.bind(this, ref, options);
		if (options.preloadBinaries === true) {
			return this._loadBinariesFromRefs(ref, options).then(load);
		} else {
			return load();
		}
	};

	/**
	 * Update an object in the world with an updated config. The object can be of any
	 * type, updating behavior is determined by the registered {ConfigHandler}.
	 *
	 * @param {string} ref Ref of object to update.
	 * @param {object} [config] New configuration (formatted according to data model).
	 * If omitted, works the same as {DynamicLoader.load}.
	 * @param {object} options
	 * @param {boolean} [options.noCache=false] Ignore cache, i.e. always load files fresh from the server.
	 * @returns {RSVP.Promise} The promise is resolved when the object is updated, with the config data as argument.
	 */
	DynamicLoader.prototype.update = function (ref, config, options) {
		var that = this;
		options = options || {};

		return this._ajax.update(ref, config).then(function (config) {
			return that._updateObject(ref, config, options);
		})
		.then(null, function (err) {
			console.error("Error updating " + ref + " " + err);
			throw err;
		});
	};

	/*
	 **** Loader functions ****
	 */

	/**
	 * Loads the object specified by the ref. If an object is already loaded,
	 * it will return that object without updating it.
	 * @param {string} ref
	 * @param {object} options
	 * @returns {object} Depending on what type of ref was loaded.
	 * @private
	 */
	DynamicLoader.prototype._loadObject = function (ref, options) {
		var type = DynamicLoader.getTypeForRef(ref);
		var handler = this._getHandler(type);
		if (handler) {
			return handler.load(ref, options);
		} else {
			return this._loadRef(ref, options);
		}
	};

	DynamicLoader.prototype.remove = function (ref) {
		this._objects.delete(ref);
		return this.update(ref, null);
	};

	/**
	 * Updates object identified by ref according to config
	 * @param {string} ref
	 * @param {object} config
	 * @param {object} options
	 * @returns {object} Depending on what's being updated
	 * @private
	 */
	DynamicLoader.prototype._updateObject = function (ref, config, options) {
		var type = DynamicLoader.getTypeForRef(ref);
		var handler = this._getHandler(type);
		if (handler) {
			return handler.update(ref, config, options);
		} else if (DynamicLoader._isRefTypeInGroup(ref, 'binary') || type !== 'bundle') {
			return PromiseUtil.resolve(config);
		} else {
			console.warn('No handler for type ' + type);
			return PromiseUtil.resolve(config);
		}
	};

	/**
	 * Fetch a file from the server, and parse JSON if needed.
	 *
	 * @param {string} ref Ref of the config to load
	 * @param {boolean} [noCache] If true, ignore cached config and fetch everything from the server
	 * @returns {RSVP.Promise} Promise that resolves with the loaded config
	 * @private
	 */
	DynamicLoader.prototype._loadRef = function (ref, options) {
		return this._ajax.load(ref, (options == null) ? false : options.noCache);
	};

	/**
	 * Recursively traverses all configs and preloads the binary files referenced.
	 * @param {object} references one-level object of references, like in datamodel
	 * @param {object} options See {DynamicLoader.load}
	 * @returns {RSVP.Promise} Promise resolving when the binary files are loaded.
	 * @private
	 */
	DynamicLoader.prototype._loadBinariesFromRefs = function (references, options) {
		var that = this;
		function loadBinaryRefs(refs) {
			var handled = 0;

			// Load the binary and increase progress tick on finished loading
			function load(ref) {
				return that._loadRef(ref, options).then(function () {
					handled++;
					if (options.progressCallback instanceof Function) {
						options.progressCallback(handled, refs.length);
					}
				});
			}

			// When all binary refs are loaded, we're done
			return RSVP.all(refs.map(function (ref) { return load(ref); }));
		}

		function traverse(refs) {
			var binaryRefs = new Set();
			var jsonRefs = new Set();

			// Loads config for traversal
			function loadFn(ref) {
				return that._loadRef(ref, options).then(traverseFn);
			}

			// Looks through config for binaries
			function traverseFn(config) {
				var promises = [];
				if (config.lazy === true) {
					return PromiseUtil.resolve();
				}
				var refs = that._getRefsFromConfig(config);

				for (var i = 0, keys = Object.keys(refs), len = refs.length; i < len; i++) {
					var ref = refs[keys[i]];
					if (DynamicLoader._isRefTypeInGroup(ref, 'asset') && !binaryRefs.has(ref)) {
						// If it's a binary ref, store it in the list
						binaryRefs.add(ref);
					} else if (DynamicLoader._isRefTypeInGroup(ref, 'json') && !jsonRefs.has(ref)) {
						// If it's a json-config, look deeper
						jsonRefs.add(ref);
						promises.push(loadFn(ref));
					}
				}
				return RSVP.all(promises);
			}

			// Resolved when everything is loaded and traversed
			return traverseFn({ collectionRefs: refs }).then(function () {
				return ArrayUtil.fromValues(binaryRefs);
			});
		}

		return traverse(references).then(loadBinaryRefs);
	};

	/**
	 * Gets cached handler for type or creates a new one.
	 * @param {string} type Type.
	 * @returns {ConfigHandler} Config handler.
	 * @private
	 */
	DynamicLoader.prototype._getHandler = function (type) {
		var handler = this._handlers[type];
		if (handler) { return handler; }
		var Handler = ConfigHandler.getHandler(type);
		if (Handler) {
			return this._handlers[type] = new Handler(
				this._world,
				this._loadRef.bind(this),
				this._updateObject.bind(this),
				this._loadObject.bind(this)
			);
		}
		return null;
	};

	/**
	 * Find all the references in a config, and return in a flat list.
	 *
	 * @param {object} config Config.
	 * @returns {string[]} refs References.
	 * @private
	 */

	var refRegex = new RegExp('\\S+refs?$', 'i');

	DynamicLoader.prototype._getRefsFromConfig = function (config) {
		var refs = [];
		function traverse(key, value) {
			if (refRegex.test(key) && key !== 'thumbnailRef') {
				// Refs
				if (value instanceof Object) {
					for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
						if (value[keys[i]]) {
							refs.push(value[keys[i]]);
						}
					}
				} else if (value) {
					// Ref
					refs.push(value);
				}
			} else if (value instanceof Object && key !== 'assets') {
				// Go down a level
				for (var i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
					traverse(keys[i], value[keys[i]]);
				}
			}
		}
		traverse('', config);
		return refs;
	};

	/**
	 * Gets the type of a reference.
	 *
	 * @param {string} ref Reference.
	 * @returns {string} Type of reference.
	 */
	DynamicLoader.getTypeForRef = function (ref) {
		return ref.substr(ref.lastIndexOf('.') + 1).toLowerCase();
	};

	/**
	 * Checks if ref has a type included in the group
	 * Different groups are found in the top of the file
	 * @private
	 * @param {string} ref
	 * @param {string} group
	 * @returns {boolean}
	 */
	DynamicLoader._isRefTypeInGroup = function (ref, group) {
		var type = DynamicLoader.getTypeForRef(ref);
		return type && Ajax.types[group] && Ajax.types[group][type];
	};

	return DynamicLoader;
});
