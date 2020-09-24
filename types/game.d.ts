// add some missing properties to the global apis

declare let canvas: {
	scene: Scene;
	tokens: {
		controlled: Token[];
		get(id: string): Token;
		_hover: Token;
		placeables: Token[];
	}
}

declare let ui: {
	notifications: Notifications;
	tables: RollTableDirectory;
	combat: CombatTracker;
	actors: ActorDirectory;
    windows: Record<number, Application>; // not an array!
    sidebar: Sidebar;
	chat: ChatLog;
	controls: any;
	hotbar: {
		macros: {
			macro: Macro | null
		}[]
	}
};