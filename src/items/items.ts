import StrikeItem from "./StrikeItem.js";
import TraitSheet from "./TraitSheet.js";
import PowerSheet from "./PowerSheet.js";
import PowerData from "./PowerData.js";

export function init() {
    CONFIG.Item.entityClass = StrikeItem as typeof Item;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fmmua", TraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("fmmua", PowerSheet, { types: ["power"], makeDefault: true });

    loadTemplates(["systems/fmmua/items/PowerCard.html"]);
}