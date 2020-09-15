import StrikeItem from "./StrikeItem.js";
import StrikeItemData from "./StrikeItemData.js";

export default class TraitSheet extends ItemSheet<StrikeItemData, StrikeItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "item", "trait"],
            template: "systems/fmmua/items/TraitSheet.html",
            width: 600
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }
}