import { RollTag, StrikeRoll } from "./StrikeRoll.js";

export function init() {    
    Handlebars.registerHelper("strike-roll", StrikeRoll.helper);
    CONFIG.Dice.rolls = [StrikeRoll];
    Roll.CHAT_TEMPLATE = "systems/fmmua/dice/roll.html";
}

export async function strikeRoll(advantage: boolean, disadvantage: boolean, flavor: string|undefined = undefined, tag: RollTag|null = null): Promise<number> {
    let label = typeof tag === "string" ? `[${tag}]` : "";

    let ex = (advantage && !disadvantage) ? "2d6kh"+label
        : (!advantage && disadvantage) ? "2d6kl"+label
        : "1d6"+label;

    let r = Roll.create(ex).evaluate();

    await r.toMessage({ flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return r.total;
}

export function skillRoll(advantage: boolean, disadvantage: boolean, unskilled: boolean = false, flavor: string|undefined = undefined): Promise<number> {
    return strikeRoll(advantage, disadvantage, flavor, unskilled ? "unskilled" : "skilled");
}

export function attackRoll(advantage: boolean, disadvantage: boolean, flavor: string|undefined = undefined): Promise<number> {
    return strikeRoll(advantage, disadvantage, flavor, "attack");
}

export function savingThrow(advantage: boolean, disadvantage: boolean, flavor: string|undefined = "Saving throw."): Promise<number> {
    return strikeRoll(advantage, disadvantage, flavor, "save");
}