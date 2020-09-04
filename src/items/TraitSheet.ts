import TraitData from "./TraitData.js";
import { TraitItem } from "./items.js";

export default class TraitSheet extends ItemSheet<TraitData, TraitItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet"],
            template: "systems/fmmua/items/TraitSheet.html"
        });
    }

    getData() {
        const data = super.getData();
        console.log(this.item);
        return data;
    }
}