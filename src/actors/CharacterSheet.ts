import StrikeActorData from "./StrikeActorData.js";
import StrikeItemData from "../items/StrikeItemData.js";
import PowerData from "../items/PowerData.js";
import StrikeActorSheet from "./StrikeActorSheet.js";

type SheetData = ActorSheetData<StrikeActorData> & {
    feats: ItemData<StrikeItemData>[];
    role: ItemData<StrikeItemData>[]
    class: ItemData<StrikeItemData>[];
    powers: ItemData<PowerData>[];
};

export default class CharacterSheet extends StrikeActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 1200,
            height: 900,
            template: "systems/fmmua/actors/CharacterSheet.html"
        });
    }

    getData() {
        let data = super.getData() as SheetData;
        
        data.feats = [];
        data.role = [];
        data.class = [];
        data.powers = [];

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
                    data.powers.push(item as ItemData<PowerData>);
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

        return data;
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