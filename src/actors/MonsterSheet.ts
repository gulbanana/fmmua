import StrikeActorData from "./StrikeActorData.js";
import StrikeActor from "./StrikeActor.js";

export default class MonsterSheet extends ActorSheet<StrikeActorData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["fmmua", "sheet", "actor", "monster"],
        width: 610,
        height: 810,
        template: "systems/fmmua/actors/MonsterSheet.html"
      });
    }
}