import StrikeActor from "../actors/StrikeActor.js";
import PowerData from "../items/PowerData.js";
import MacroSheet from "./MacroSheet.js";

export function init() {
    CONFIG.Macro.sheetClass = MacroSheet;
 
    Hooks.on("hotbarDrop", onHotbarDrop);
    Hooks.on("preUpdateOwnedItem", onPreUpdateOwnedItem);

    let lang = hljs.getLanguage("javascript");
    lang.keywords.params = "";
    for (let param of ["speaker", "actor", "token", "character", "power"]) {
        lang.keywords.params = `${lang.keywords.params} ${param}`;
    }
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
    let script = `actor?.use(this.name)`;
    let macro = ui.hotbar.macros.map(m => m.macro).find(m => m != null && m.data.command == script && m.data.name == power.name);

    if (!macro) {
      macro = await Macro.create({
        name: power.name,
        type: "script",
        img: power.data.customImage || power.img,
        command: script,
        flags: { "fmmua.power": true }
      });
    }

    game.user.assignHotbarMacro(macro, slot);
    
    return false;
}

function onPreUpdateOwnedItem(actor: StrikeActor, itemData: Record<string, any>, updateData: Record<string, any>, _options: {diff: boolean}, userId: string) {
    if (itemData.type == "power" && updateData.name && updateData.name != itemData.name) {
        // try to find a corresponding macro and update it
        let script = `actor?.use(this.name)`;
        let macro = ui.hotbar.macros.map(m => m.macro).find(m => m != null && m.data.command == script && m.data.name == itemData.name);
        if (macro) {
            macro?.update({
                "name": updateData.name
            });
        }
    }
}