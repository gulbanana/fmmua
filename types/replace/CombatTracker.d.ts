// foundry-pc-types version is just a Record<string, any>

declare class CombatTracker<T extends Combat = Combat> extends SidebarTab {
    /**
     * Record a reference to the currently highlighted Token
     */
    _highlighted: Token | null;

    /**
     * Record the currently tracked Combat encounter
     */
    combat: T | null; 

    /**
     * Initialize the combat tracker to display a specific combat encounter.
     * If no encounter is provided, the tracker will be initialized with the first encounter in the viewed scene.
     */
    initialize(options?: {combat?: Combat|null, render?: boolean});

  /**
   * Get the sidebar directory entry context options
   */
    _getEntryContextOptions(): {
        name: string;
        icon: string;
        callback: (li: JQuery) => void
    }[];
    // more methods missing
}