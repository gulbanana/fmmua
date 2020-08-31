import PowerItem from "./PowerItem.js";

export function init() {
    CONFIG.Item.entityClass = PowerItem as typeof Item;
    // Actors.unregisterSheet("core", ItemSheet);
    // Actors.registerSheet("fmmua", PowerSheet, { types: ["power"], makeDefault: true });
}