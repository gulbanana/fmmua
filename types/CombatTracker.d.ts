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
     * Cache the values of additional tracked resources for each Token in Combat
     * @type {Object}
     */
    trackedResources: Record<string, Record<string, number>>;

    /**
     * Initialize the combat tracker to display a specific combat encounter.
     * If no encounter is provided, the tracker will be initialized with the first encounter in the viewed scene.
     */
    initialize(options?: {combat?: Combat|null, render?: boolean});

    /**
     * Update the value of tracked resources which are reported for each combatant
     */
    updateTrackedResources(): Record<string, Record<string, number>>;

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