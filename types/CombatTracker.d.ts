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
    trackedResources: Record<string, any>;

    updateTrackedResources(): Record<string, any>;

    // more methods missing
}