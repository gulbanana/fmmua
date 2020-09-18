import StrikeActorSheet from "./StrikeActorSheet.js";
import TraitData from "../items/TraitData.js";
import PowerData from "../items/PowerData.js";
import StrikeItemData from "../items/StrikeItemData.js";
import StrikeActorData from "./StrikeActorData.js";

type SheetData = ActorSheetData<StrikeActorData> & {
    traits: ItemData<TraitData>[];
    powers: ItemData<PowerData>[];
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

        data.items.forEach((item: ItemData<StrikeItemData>) => {
            switch (item.type) {
                case "trait":
                    data.traits.push(item as ItemData<TraitData>);
                    break;

                case "power":
                    data.powers.push(item as ItemData<PowerData>);
                    break;
            }
        });

        data.powers.sort(this.comparePowers);
        data.traits.sort((a, b) => a.name.localeCompare(b.name));

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        if (this._canDragStart(".item")) {
            let handler = (ev: DragEvent) => this._onDragStart(ev);
            html.find('.item').each((_index, div) => {
              div.setAttribute("draggable", "true");
              div.addEventListener("dragstart", handler, false);
            });
        }
    }
}