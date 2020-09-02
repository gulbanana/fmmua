import FeatData from "./FeatData.js";
import { FeatItem } from "./items.js";

export default class FeatSheet extends ItemSheet<FeatData, FeatItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet"],
            template: "systems/fmmua/items/FeatSheet.html"
        });
    }

    getData() {
        const data = super.getData();
        console.log(this.item);
        return data;
    }
}