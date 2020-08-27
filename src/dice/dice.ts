import { RollTag, StrikeRoll } from "./StrikeRoll.js";

export function init() {    
    Handlebars.registerHelper("strike-roll", StrikeRoll.helper);
    CONFIG.Dice.rolls = [StrikeRoll];
    Roll.CHAT_TEMPLATE = "systems/fmmua/dice/roll.html";
}

function rollCore(advantage: boolean, disadvantage: boolean, tag: RollTag|null = null): Roll {
    let label = typeof tag === "string" ? `[${tag}]` : "";

    let ex = (advantage && !disadvantage) ? "2d6kh"+label
        : (!advantage && disadvantage) ? "2d6kl"+label
        : "1d6"+label;

    let r = Roll.create(ex);
    return r.evaluate();
}

export async function strikeRoll(advantage: boolean, disadvantage: boolean, flavor: string|undefined = undefined): Promise<number> {
    let roll = rollCore(advantage, disadvantage);

    await roll.toMessage({ flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}

export async function skillRoll(advantage: boolean, disadvantage: boolean, unskilled: boolean = false, flavor: string|undefined = undefined): Promise<number> {
    let roll = rollCore(advantage, disadvantage, unskilled ? "unskilled" : "skilled");

    await roll.toMessage({ flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });
    
    return roll.total;
}

export async function attackRoll(advantage: boolean, disadvantage: boolean, flavor: string|undefined = undefined): Promise<number> {
    let roll = rollCore(advantage, disadvantage, "attack");

    await roll.toMessage({ flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}

export async function savingThrow(advantage: boolean, disadvantage: boolean, flavor: string|undefined = "Saving throw."): Promise<number> {
    let roll = rollCore(advantage, disadvantage, "save");

    await roll.toMessage({ flavor }, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}