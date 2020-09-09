declare let ui: {
	notifications: Notifications;
	tables: RollTableDirectory;
	combat: CombatTracker;
	actors: ActorDirectory;
    windows: Application[];
    sidebar: Sidebar;
    chat: ChatLog & {
		element: JQuery;
	}
};