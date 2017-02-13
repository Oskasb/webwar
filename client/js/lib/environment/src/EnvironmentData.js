"use strict";

define(function() {

	var cycles = [
		{ //
			name:'morning',
			values:{
				sunLight:		[0.7, 0.65, 0.5		],
				sunDir:			[-0.6, -0.3, -0.3	],
				ambientLight:	[0.4, 0.4, 0.7		],
				skyColor:		[0.6, 0.6, 0.81		],
				fogColor:		[0.68, 0.71, 0.81	],
				fogDistance: 	[0.1, 1.4			]
			}
		},
		{ //
			name:'day',
			values:{
				sunLight:[0.96, 0.85, 0.6],
				sunDir:[-0.4, -0.6, -0.4],
				ambientLight:[0.2, 0.3, 0.5],
				skyColor:[0.61, 0.68, 0.74],
				fogColor:[0.69, 0.71, 0.81],
				fogDistance: [0.3, 1.9]
			}
		},
		{ //
			name:'noon',
			values:{
				sunLight:[0.96, 0.8, 0.6],
				sunDir:[-0.2, -0.9, -0.4],
				ambientLight:[0.3, 0.4, 0.6],
				skyColor:[0.62, 0.65, 0.75],
				fogColor:[0.71, 0.72, 0.81],
				fogDistance: [0.3, 2.8]
			}
		},
		{ //
			name: 'afternoon',
			values:{
				sunLight:[0.9, 0.7, 0.5],
				sunDir:[-0.2, -0.7, -0.4],
				ambientLight:[0.1, 0.2, 0.4],
				skyColor:[0.4, 0.55, 0.78],
				fogColor:[0.60, 0.68, 0.79],
				fogDistance: [0.5, 1.7]
			}
		}
	];

	var globals = {
		baseFogNear: 15,
		baseFogFar:200,
		baseCycleDuration: 10000,
		startCycleIndex: 0
	};

	return {
		globals:globals,
		cycles:cycles
	};

});
