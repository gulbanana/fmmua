import StrikeItem from "./StrikeItem.js";
import TraitSheet from "./TraitSheet.js";
import PowerSheet from "./PowerSheet.js";

export function _init() {
    CONFIG.Item.entityClass = StrikeItem as typeof Item;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fmmua", TraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("fmmua", PowerSheet, { types: ["power"], makeDefault: true });

    loadTemplates(["systems/fmmua/items/PowerCard.html"]);

    Object.defineProperty(ChatPopout, "defaultOptions", {
        get: defaultChatPopoutOptions
    });
}

function defaultChatPopoutOptions() {
    return mergeObject(Application.defaultOptions, {
      width: 400,
      height: "auto",
      classes: ["chat-popout"]
    });
}