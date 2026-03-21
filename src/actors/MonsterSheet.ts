import StrikeActorSheet from "./StrikeActorSheet.js";
import StrikeActor from "./StrikeActor.js";
import TraitData from "../items/TraitData.js";
import PowerData from "../items/PowerData.js";
import StrikeItemData from "../items/StrikeItemData.js";

type SheetData = ActorSheet.Data<StrikeActor> & {
    traits: Item.Data<TraitData>[];
    powers: Item.Data<PowerData>[];
};

export default class MonsterSheet extends StrikeActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "monster"],
            width: 600,
            height: 857,
            template: "systems/fmmua/actors/MonsterSheet.html"
        });
    }

    getData() {
        let data = super.getData() as SheetData;

        data.traits = [];
        data.powers = [];

        (data.items as Item.Data<StrikeItemData>[]).forEach(item => {
            switch (item.type) {
                case "trait":
                    data.traits.push(item as Item.Data<TraitData>);
                    break;

                case "power":
                    data.powers.push(item as Item.Data<PowerData>);
                    break;
            }
        });

        data.powers.sort(this.comparePowers);
        data.traits.sort((a, b) => a.name.localeCompare(b.name));

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
        super.resizeFloats(html);
    }
}
