"use strict";

define(function() {
    var func = function(){};
    return {
		ANALYTICS_EVENT:{type:'ANALYTICS_EVENT', args:{}},
		SETTING_CONTROL_EVENT:{type:'SETTING_CONTROL_EVENT', args:{}},
		SCREEN_CONFIG:{type:'SCREEN_CONFIG', args:{}},

		ENGINE_READY:{type:'ENGINE_READY', args:{}},
		PARTICLES_READY:{type:'PARTICLES_READY', args:{}},
		BUNDLES_READY:{type:'BUNDLES_READY', args:{}},
		
		MONITOR_STATUS:{type:'MONITOR_STATUS', args:{}},
        BUTTON_EVENT:{type:'BUTTON_EVENT', args:{}},
        
		INIT_CLIENT:{type:'INIT_CLIENT', args:{data:{}}},
		CONNECTION_CLOSED:{type:'CONNECTION_CLOSED', args:{data:{}}},

		SEND_SERVER_REQUEST:{type:'SEND_SERVER_REQUEST', args:{data:{}}},
		NOTIFY_MODULE_ONOFF:{type:'NOTIFY_MODULE_ONOFF', args:{}},
		
		MESSAGE_UI:{type:'MESSAGE_UI', args:{}},
		MESSAGE_POPUP:{type:'MESSAGE_POPUP', args:{}},

		
		TICK_STATUS_MONITOR:{type:'TICK_STATUS_MONITOR', args:{data:{}}},

		CLIENT_TICK:{type:'CLIENT_TICK', args:{data:{}}},
        CAMERA_TICK:{type:'CAMERA_TICK', args:{data:{}}},
		SERVER_MESSAGE:{type:'SERVER_MESSAGE', args:{data:{}}},

		CURSOR_MOVE:{type:'CURSOR_MOVE', args:{data:{}}},
		CURSOR_LINE:{type:'CURSOR_LINE', args:{data:{}}},
		CURSOR_PRESS:{type:'CURSOR_PRESS', args:{data:{}}},
		CURSOR_RELEASE:{type:'CURSOR_RELEASE', args:{data:{}}},
		CURSOR_START_DRAG:{type:'CURSOR_START_DRAG', args:{data:{}}},
		CURSOR_DRAG_TO:{type:'CURSOR_DRAG_TO', args:{data:{}}},
		CURSOR_RELEASE_FAST:{type:'CURSOR_RELEASE_FAST', args:{data:{}}},
		
		PARTICLE_TEXT:{type:'PARTICLE_TEXT', args:{}},

		SHARED_LOADED:{type:'SHARED_LOADED', args:{}},
		
		GAME_EFFECT:{type:'GAME_EFFECT', args:{effect:"string", pos:{data:[0, 0, 0]}, vel:{data:[0, 0, 0]}, callbacks:{}}},

		INPUT_PLAYER_CONTROL:{type:'INPUT_PLAYER_CONTROL', args:{data:{}}},
		CONTROLLED_PIECE_UPDATED:{type:'CONTROLLED_PIECE_UPDATED', args:{}},

		DRAW_RELATIVE_LINE:{type:'DRAW_RELATIVE_LINE', args:{}},

		DRAW_RELATIVE_POS_RAD:{type:'DRAW_RELATIVE_POS_RAD', args:{}},

		DRAW_LINE_BETWEEN:{type:'DRAW_LINE_BETWEEN', args:{}},
		DRAW_POINT_AT:{type:'DRAW_POINT_AT', args:{}},

		CAMERA_READY:{type:'CAMERA_READY', args:{}},
        CONNECTION_OPEN:{type:'CONNECTION_OPEN', args:{}},

        PIECE_COMMANDER_CHANGE:{type:'PIECE_COMMANDER_CHANGE', args:{}},
		PLAYER_READY:{type:'PLAYER_READY', args:{}}
    }
});
