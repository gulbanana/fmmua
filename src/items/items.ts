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

    Hooks.on("hotbarDrop", onHotbarDrop);
}

type DropData = {
    type: "Item",
    actorId: string,
    data: ItemData<PowerData>
} | {
    type: "Actor" | "Scene"
}

async function onHotbarDrop(_hotbar: any, data: DropData, slot: number): Promise<boolean> {
    if (data.type != "Item" || data.data === undefined || data.data.type != "power") {
        return true;
    }

    let power = data.data;
    let script = `actor?.use("${power.name}")`;
    let macro = game.macros.entities.find(m => (m.name === power.name) && (m.command === script));
    
    if (!macro) {
      macro = await Macro.create({
        name: power.name,
        type: "script",
        img: power.img,
        command: script,
        flags: { "fmmua.power": true }
      });
    }

    game.user.assignHotbarMacro(macro, slot);
    
    return false;
}