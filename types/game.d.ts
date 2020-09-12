// add some missing properties to the global apis

declare let canvas: {
	tokens: {
		controlled: Token[];
		get(id: string): Token;		
	}
}

declare let ui: {
	notifications: Notifications;
	tables: RollTableDirectory;
	combat: CombatTracker;
	actors: ActorDirectory;
    windows: Application[];
    sidebar: Sidebar;
    chat: ChatLog;
};