// Narrow nullable globals for use within game hooks where they are guaranteed initialized.
// foundry-vtt-types marks canvas as nullable and ui properties as optional.

declare let canvas: Canvas;

declare const ui: {
	actors: ActorDirectory;
	chat: ChatLog;
	combat: CombatTracker;
	controls: SceneControls;
	hotbar: Hotbar;
	notifications: Notifications;
	sidebar: Sidebar;
	tables: RollTableDirectory;
	windows: Record<number, Application>;
};
