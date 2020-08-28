import StrikeActor from "./StrikeActor.js";
import StrikeCharacterSheet from "./StrikeCharacterSheet.js";

export function init() {
    CONFIG.Actor.entityClass = StrikeActor;  
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fmmua", StrikeCharacterSheet, { types: ["pc"], makeDefault: true });
}