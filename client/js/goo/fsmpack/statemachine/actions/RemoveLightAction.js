define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function RemoveLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveLightAction.prototype = Object.create(Action.prototype);
	RemoveLightAction.prototype.constructor = RemoveLightAction;

	RemoveLightAction.external = {
		name: 'Remove Light',
		type: 'light',
		description: 'Removes the light attached to the entity',
		parameters: [],
		transitions: []
	};

	RemoveLightAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};

	return RemoveLightAction;
});