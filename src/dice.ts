function rollCore(advantage: boolean, disadvantage: boolean): Roll {
    let ex = (advantage && !disadvantage) ? "2d6kh"
    : (!advantage && disadvantage) ? "2d6kl"
    : "1d6";

    let r = new Roll(ex);
    return r.roll();
}

export async function strikeRoll(advantage: boolean, disadvantage: boolean): Promise<number> {
    let roll = rollCore(advantage, disadvantage);

    await roll.toMessage(undefined, {
        create: true,
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}

export async function skillRoll(advantage: boolean, disadvantage: boolean): Promise<number> {
    let roll = rollCore(advantage, disadvantage);

    let flavor = roll.total == 6 ? "Success with a Bonus!"
        : roll.total > 3 ? "Success."
        : roll.total == 3 ? "Success with a Cost."
        : roll.total == 2 ? "Twist."
        : "Twist with a Cost!";

    await CONFIG.ChatMessage.entityClass.create({
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,
        roll, flavor
    }, {
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}

export async function attackRoll(advantage: boolean, disadvantage: boolean): Promise<number> {
    let roll = rollCore(advantage, disadvantage);

    let flavor = roll.total == 6 ? "Critical Hit - 2x Damage and Effect!"
        : roll.total > 3 ? "Solid Hit - Damage and Effect."
        : roll.total == 3 ? "Glancing Hit - Damage or Effect."
        : roll.total == 2 ? "Miss."
        : "Strike!";

    await CONFIG.ChatMessage.entityClass.create({
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,
        roll, flavor
    }, {
        rollMode: game.settings.get("core", "rollMode")
    });

    return roll.total;
}