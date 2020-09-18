import StrikeItem from "./StrikeItem.js";
import StrikeItemData from "./StrikeItemData.js";
import PowerData, { Target } from "./PowerData.js";

type SheetData = ItemSheetData<PowerData> & {
    tMelee: boolean;
    tRange: string;
    tBurst: string;
};

export default class PowerSheet extends ItemSheet<StrikeItemData, StrikeItem> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "item", "power"],
            template: "systems/fmmua/items/PowerSheet.html",
            width: 600
        });
    }

    getData() {
        const data = super.getData() as SheetData;

        data.tMelee = false;
        data.tRange = "";
        data.tBurst = "";

        for (let t of data.data.targets) {
            if (t.mode == "melee") {
                data.tMelee = true;
            } else {
                data.tRange = t.range.toString();
            }
            data.tBurst = t.burst?.toString() || "";
        }

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);
                
        let usage = html.find<HTMLSelectElement>("select[name=data\\.usage]")[0];
        let customUsage = html.find<HTMLInputElement>("input[name=data\\.customUsage]")[0];

        usage.addEventListener("change", _ev => {
            if (usage.value !== "custom") {
                customUsage.value = "";
            }
        });

        customUsage.addEventListener("change", _ev => {
            if (customUsage.value) {
                usage.value = "custom";
            }
        });
    }

    _getSubmitData(updateData={}): any {
        let data = super._getSubmitData(updateData);

        let meleeInput = this.form.querySelector<HTMLInputElement>("input[name=tMelee]");
        let rangeInput = this.form.querySelector<HTMLInputElement>("input[name=tRange]");
        let burstInput = this.form.querySelector<HTMLInputElement>("input[name=tBurst]");

        let targets: Target[] = [];
        
        if (meleeInput?.checked) {
            targets.push({
                mode: "melee",
                burst: burstInput?.value ? parseInt(burstInput?.value) : undefined
            });
        } 

        if (rangeInput?.value) {
            targets.push({
                mode: "ranged",
                range: parseInt(rangeInput?.value || "0"),
                burst: burstInput?.value ? parseInt(burstInput?.value) : undefined
            });
        }

        if (!targets.length && burstInput?.value) {
            targets.push({
                mode: "melee",
                burst: parseInt(burstInput?.value)
            });
        }

        data["data.targets"] = targets;

        return data;
    }
}