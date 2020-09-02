import PowerData from "./PowerData.js";
import { PowerItem } from "./items.js";

export default class PowerSheet extends ItemSheet<PowerData, PowerItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet"],
            template: "systems/fmmua/items/PowerSheet.html"
        });
    }

    getData() {
        const data = super.getData();
        console.log(this.item);
        return data;
    }
}