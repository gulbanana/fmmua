import StrikeActorData from "./StrikeActorData.js";
import StrikeItemData from "../items/StrikeItemData.js";
import PowerData from "../items/PowerData.js";
import StrikeActorSheet from "./StrikeActorSheet.js";

type SheetData = ActorSheetData<StrikeActorData> & {
    feats: ItemData<StrikeItemData>[];
    role: ItemData<StrikeItemData>[]
    class: ItemData<StrikeItemData>[];
    
    ungroupedPowers: boolean;
    powers: ItemData<PowerData>[];
    
    groupedPowers: boolean;
    otherPowers: ItemData<PowerData>[];
    rolePowers: ItemData<PowerData>[];
    classPowers: ItemData<PowerData>[];    
};

export default class CharacterSheet extends StrikeActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 1000,
            height: 700,
            template: "systems/fmmua/actors/CharacterSheet.html"
        });
    }

    getData() {
        let data = super.getData() as SheetData;
        
        data.feats = [];
        data.role = [];
        data.class = [];
        data.powers = [];
        data.classPowers = [];
        data.rolePowers = [];
        data.otherPowers = [];

        data.items.forEach((item: ItemData<StrikeItemData>) => {
            switch (item.type) {
                case "trait":
                    switch (item.data.source) {
                        case "feat":
                            data.feats.push(item);
                            break;

                        case "role":
                            data.role.push(item);
                            break;

                        case "class":
                            data.class.push(item);
                            break;
                            
                        default:
                            data.feats.push(item);
                            break;
                    }
                    break;

                case "power":
                    let power = item as ItemData<PowerData>;
                    data.powers.push(power);

                    switch (item.data.source) {
                        case "class":
                            data.classPowers.push(power);
                            break;

                        case "role":
                            data.rolePowers.push(power);
                            break;

                        default:
                            data.otherPowers.push(power);
                            break;
                    }                    
                    break;
            }
        });

        data.powers.sort((a, b) => {
            if (sortBySource(a.data.source) < sortBySource(b.data.source)) {
                return -1;
            } else {
                return 0;
            }
        })

        data.groupedPowers = game.settings.get("fmmua", "actorsGroupPowers");
        data.ungroupedPowers = !data.groupedPowers;

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        if (this._canDragStart(".item.power")) {
            let handler = (ev: DragEvent) => this._onDragStart(ev);
            html.find('.item.power').each((_index, div) => {
              div.setAttribute("draggable", "true");
              div.addEventListener("dragstart", handler, false);
            });
        }
    }
}

function returnsSource() {
    return ({} as PowerData).source;
}

function sortBySource(source: ReturnType<typeof returnsSource>) {
    switch (source) {
        case "feat":
            return 0;

        case "role":
            return 1;

        case "class":
            return 2;

        default:
            return -1;
    }
}