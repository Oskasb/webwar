define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function LogMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LogMessageAction.prototype = Object.create(Action.prototype);
	LogMessageAction.prototype.constructor = LogMessageAction;

	LogMessageAction.external = {
		name: 'Log Message',
		description: 'Prints a message in the debug console of your browser',
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'Message to print',
			'default': 'hello'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	LogMessageAction.prototype._run = function(/*fsm*/) {
		console.log(this.message);
	};

	return LogMessageAction;
});