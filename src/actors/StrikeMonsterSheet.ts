import { StrikeData } from "./actors.js";
import StrikeActor from "./StrikeActor";

export default class StrikeMonsterSheet extends ActorSheet<StrikeData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["fmmua", "sheet"],
        width: 610,
        height: 810,
        template: "systems/fmmua/actors/StrikeMonsterSheet.html"
      });
    }

    constructor(...args: any) {
        super(...args);
    }

    getData() {
        const data = super.getData();
        console.log("actor data:");
        console.log(data);
        return data;
    }
}