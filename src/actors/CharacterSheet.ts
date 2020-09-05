import StrikeData from "./StrikeData.js";
import StrikeActor from "./StrikeActor.js";
import StrikeItemData from "../items/StrikeData.js";
import PowerData from "../items/PowerData.js";

class SheetSection {
    traits: ItemData<StrikeItemData>[] = [];
    powers: ItemData<StrikeItemData>[] = [];
}

type SheetData = ActorSheetData<StrikeData> & {
    feats: SheetSection;
    role: SheetSection;
    class: SheetSection;
};

export default class CharacterSheet extends ActorSheet<StrikeData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 610,
            height: 810,
            template: "systems/fmmua/actors/CharacterSheet.html"
        });
    }

    getData() {
        let data = super.getData() as SheetData;
        
        data.feats = new SheetSection();
        data.role = new SheetSection();
        data.class = new SheetSection();

        data.items.forEach((item: ItemData<StrikeItemData>) => {
            switch (item.type) {
                case "trait":
                    switch (item.data.source) {
                        case "feat":
                            data.feats.traits.push(item);
                            break;

                        case "role":
                            data.role.traits.push(item);
                            break;

                        case "class":
                            data.class.traits.push(item);
                            break;
                            
                        default:
                            data.feats.traits.push(item);
                            break;
                    }
                    break;

                case "power":
                    switch (item.data.source) {
                        case "feat":
                            data.feats.powers.push(item);
                            break;

                        case "role":
                            data.role.powers.push(item);
                            break;

                        case "class":
                            data.class.powers.push(item);
                            break;
                            
                        default:
                            data.class.powers.push(item);
                            break;
                    }
                    break;
            }
        });

        return data;
    }
}