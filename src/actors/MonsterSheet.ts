import StrikeData from "./StrikeData.js";
import StrikeActor from "./StrikeActor.js";

export default class MonsterSheet extends ActorSheet<StrikeData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["fmmua", "sheet"],
        width: 610,
        height: 810,
        template: "systems/fmmua/actors/MonsterSheet.html"
      });
    }

    constructor(...args: any) {
        super(...args);
    }

    getData() {
        const data = super.getData();
        return data;
    }
}