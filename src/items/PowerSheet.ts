import StrikeItem from "./StrikeItem.js";
import StrikeItemData from "./StrikeItemData.js";
import PowerData from "./PowerData.js";

type SheetData = ItemSheetData<PowerData> & {
    t1melee: boolean;
    t2melee: boolean;
};

export default class PowerSheet extends ItemSheet<StrikeItemData, StrikeItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet"],
            template: "systems/fmmua/items/PowerSheet.html",
            width: 600
        });
    }

    getData() {
        const data = super.getData() as SheetData;

        data.t1melee = true;

        return data;
    }

    _getSubmitData(updateData={}): any {
        let data = super._getSubmitData(updateData);

        // store nulls for "no override", though other code should be changed to ignore empty strings
        if (data["data.customType"] === "") {
            data["data.customType"] = null;
        }

        if (data["data.customSubtype"] === "") {
            data["data.customSubtype"] = null;
        }

        // read this.form, set targets array (full data duplicate)

        return data;
    }
}