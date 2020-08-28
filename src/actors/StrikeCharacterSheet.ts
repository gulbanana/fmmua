import StrikeActor from "./StrikeActor";

export default class StrikeCharacterSheet extends ActorSheet<any, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["fmmua", "sheet"],
        width: 720,
        height: 680,
        template: "systems/fmmua/actors/StrikeCharacterSheet.html"
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