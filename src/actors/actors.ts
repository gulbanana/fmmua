import StrikeActor from "./StrikeActor.js";
import StrikeCharacterSheet from "./StrikeCharacterSheet.js";
import StrikeMonsterSheet from "./StrikeMonsterSheet.js";

export function init() {
    CONFIG.Actor.entityClass = StrikeActor as typeof Actor;  
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fmmua", StrikeCharacterSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("fmmua", StrikeMonsterSheet, { types: ["monster"], makeDefault: true });
}

export interface StrikeData {
    level: number;
    speed: number;
    hp: {
        value: number;
        max: number;
    },
    ap: {
        value: number;
        max: number;
    }
    class?: string;
    role?: string;
}