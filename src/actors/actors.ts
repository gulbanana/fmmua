import StrikeActor from "./StrikeActor.js";
import CharacterSheet from "./CharacterSheet.js";
import MonsterSheet from "./MonsterSheet.js";

export function init() {
    CONFIG.Actor.entityClass = StrikeActor as typeof Actor;  
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fmmua", CharacterSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("fmmua", MonsterSheet, { types: ["monster"], makeDefault: true });
}