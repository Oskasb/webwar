/**
 * Everything we need from underscore.js. Convenience stuff, copied straight off.
 * For documentation, see http://underscorejs.org. Gotta love open source.
 */
define(function () {
	'use strict';

	var _ = {};

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var slice = ArrayProto.slice;

	var nativeForEach = ArrayProto.forEach;

	_.defaults = function (obj) {
		each(slice.call(arguments, 1), function (source) {
			if (source) {
				//! AT: apparently for in loops are the source of all evil (function can't be optimised, yadayada)
				// write a unit test before refactoring to ensure the semantics are the same
				for (var prop in source) {
					if (typeof obj[prop] === 'undefined' || obj[prop] === null) { obj[prop] = source[prop]; }
				}
			}
		});
		return obj;
	};

	_.extend = function (obj) {
		each(slice.call(arguments, 1), function (source) {
			if (source) {
				//! AT: apparently for in loops are the source of all evil (function can't be optimised, yadayada)
				// write a unit test before refactoring to ensure the semantics are the same
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};

	_.isObject = function(obj) {
		return obj === Object(obj);
	};

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) {
		if (!_.isObject(obj)) { return obj; }
		return Array.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = _.each = _.forEach = function (obj, iterator, context, sortProp) {
		if (typeof obj === 'undefined' || obj === null) {return;}
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				iterator.call(context, obj[i], i, obj);
			}
		} else {
			var keys = Object.keys(obj);
			if (sortProp !== undefined) {
				keys.sort(function(a, b) {
					return obj[a][sortProp] - obj[b][sortProp];
				});
			}
			for (var i = 0, length = keys.length; i < length; i++) {
				iterator.call(context, obj[keys[i]], keys[i], obj);
			}
		}
	};

	/**
	 * Performs a deep clone. Can handle primitive types, arrays, generic objects, typed arrays and html nodes. Functions are shared. Does not handle circular references - also does not preserve original constructors/prototypes.
	 * @param {*} object Object to clone
	 * @returns {*}
	 */
	_.deepClone = function (object) {
		// handle primitive types, functions, null and undefined
		if (object === null || typeof object !== 'object') {
			return object;
		}

		// handle typed arrays
		if (Object.prototype.toString.call(object.buffer) === '[object ArrayBuffer]') {
			return new object.constructor(object);
		}

		// handle arrays (even sparse ones)
		if (object instanceof Array) {
			return object.map(_.deepClone);
		}

		// handle html nodes
		if (object.nodeType && typeof object.cloneNode === 'function') {
			return object.cloneNode(true);
		}

		// handle generic objects
		// prototypes and constructors will not match in the clone
		var copy = {};
		var keys = Object.keys(object);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			copy[key] = _.deepClone(object[key]);
		}
		return copy;
	};

	_.shallowSelectiveClone = function (source, keys) {
		var clone = {};

		keys.forEach(function (key) {
			clone[key] = source[key];
		});

		return clone;
	};

	// probably not the best way to copy maps and sets
	_.cloneMap = function (source) {
		var clone = new Map();
		source.forEach(function (value, key) {
			clone.set(key, value);
		});
		return clone;
	};

	_.cloneSet = function (source) {
		var clone = new Set();
		source.forEach(function (value) {
			clone.add(value);
		});
		return clone;
	};

	return _;
});