import { RollTag, StrikeRoll } from "./StrikeRoll.js";
import RollDialog from "./RollDialog.js";

export function _init() {    
    // render rolled strike dice with semantic interpretation    
    Handlebars.registerHelper("strike-roll", StrikeRoll.helper);
    CONFIG.Dice.rolls = [StrikeRoll];
    Roll.CHAT_TEMPLATE = "systems/fmmua/dice/roll.html";

    // add a quick shortcut for a UI-based roll
    Hooks.on("renderChatLog", (_app: Application, html: JQuery<HTMLElement>, _data: any) => {
        html.on("click", ".chat-control-icon", () => RollDialog.run());
        let icon = html[0].querySelector(".chat-control-icon > i")!;
        icon.classList.remove("fa-dice-d20");
        icon.classList.add("fa-dice-d6");
    });
}

// public api for rolling strike dice

export async function strikeRoll(options: {advantage?: boolean, disadvantage?: boolean, flavor?: string, tag?: RollTag} = {}): Promise<number> {
    let label = typeof options?.tag === "string" ? `[${options?.tag}]` : "";

    let ex = (options?.advantage && !options?.disadvantage) ? "2d6kh"+label
        : (!options?.advantage && options?.disadvantage) ? "2d6kl"+label
        : "1d6"+label;

    let r = Roll.create(ex).evaluate();

    await r.toMessage({ flavor: options?.flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return r.total;
}

export function skillRoll(advantage: boolean, disadvantage: boolean, unskilled: boolean = false, flavor: string|undefined = undefined): Promise<number> {
    return strikeRoll({advantage, disadvantage, flavor, tag: unskilled ? "unskilled" : "skilled"});
}

export function attackRoll(advantage: boolean, disadvantage: boolean, flavor: string|undefined = undefined): Promise<number> {
    return strikeRoll({advantage, disadvantage, flavor, tag: "attack"});
}

export function savingThrow(advantage: boolean, disadvantage: boolean, flavor: string|undefined = "Saving throw."): Promise<number> {
    return strikeRoll({advantage, disadvantage, flavor, tag: "save"});
}