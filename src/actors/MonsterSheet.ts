import StrikeData from "./StrikeData.js";
import StrikeActor from "./StrikeActor.js";

export default class MonsterSheet extends ActorSheet<StrikeData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["fmmua", "sheet", "actor", "monster"],
        width: 610,
        height: 810,
        template: "systems/fmmua/actors/MonsterSheet.html"
      });
    }
}