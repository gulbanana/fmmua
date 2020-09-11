import StrikeItem from "./StrikeItem.js";
import StrikeItemData from "./StrikeItemData.js";
import PowerData from "./PowerData.js";

export default class PowerSheet extends ItemSheet<StrikeItemData, StrikeItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet"],
            template: "systems/fmmua/items/PowerSheet.html",
            width: 600
        });
    }

    getData() {
        const data = super.getData() as ItemSheetData<PowerData>;
        return data;
    }
}