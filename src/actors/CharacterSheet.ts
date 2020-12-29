import * as dice from "../dice/dice.js";
import CharacterData from "./CharacterData.js";
import StrikeItemData from "../items/StrikeItemData.js";
import PowerData from "../items/PowerData.js";
import StrikeActorSheet from "./StrikeActorSheet.js";
import RollDialog from "../dice/RollDialog.js";

type SheetData = ActorSheetData<CharacterData> & {
    data: CharacterData;

    feats: ItemData<StrikeItemData>[];
    role: ItemData<StrikeItemData>[]
    class: ItemData<StrikeItemData>[];
    
    ungroupedPowers: boolean;
    powers: ItemData<PowerData>[];
    
    groupedPowers: boolean;
    otherPowers: ItemData<PowerData>[];
    rolePowers: ItemData<PowerData>[];
    classPowers: ItemData<PowerData>[];    

    wealthChoice: string;
    wealthChoices: Record<string, string>;
};

export default class CharacterSheet extends StrikeActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 1000,
            height: 800,
            template: "systems/fmmua/actors/CharacterSheet.html",
            tabs: [{ navSelector: ".tab-headers", contentSelector: ".tab-content", initial: "adventure" }]
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

        data.wealthChoice = data.data.wealth.toString();
        data.wealthChoices = {
            "0": "Penniless",
            "1": "Poor",
            "2": "Rich",
            "3": "Super-rich"
        }

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

        data.powers.sort(this.comparePowers);
        data.classPowers.sort(this.comparePowers);
        data.rolePowers.sort(this.comparePowers);
        data.otherPowers.sort(this.comparePowers);

        data.groupedPowers = game.settings.get("fmmua", "actorsGroupPowers");
        data.ungroupedPowers = !data.groupedPowers;

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('.skill-roll').click(ev => this.onSkillRoll($(ev.currentTarget).siblings("input"), false, true));
        html.find('.skill-roll').contextmenu(ev => this.onSkillRoll($(ev.currentTarget).siblings("input"), true, true));
        html.find('.unskilled-roll').click(ev => this.onSkillRoll($(ev.currentTarget).siblings("input"), false, false));
        html.find('.unskilled-roll').contextmenu(ev => this.onSkillRoll($(ev.currentTarget).siblings("input"), true, false));

        if (this._canDragStart(".item.power")) {
            let handler = (ev: DragEvent) => this._onDragStart(ev);
            html.find('.item.power').each((_index, div) => {
              div.setAttribute("draggable", "true");
              div.addEventListener("dragstart", handler, false);
            });
        }

        if (this._tabs[0].active == "tactical") {
            super.resizeFloats(html);
        }
    }

    onSkillRoll(html: JQuery, dialog: boolean, skilled: boolean) {
        if (!this.isEditable) {
            return;
        }

        const skillName = html.val();
        if (typeof skillName == "string" && skillName) {
            if (dialog) { 
                if (skilled) {
                    RollDialog.run(`${this.actor.name} rolls ${skillName}.`);
                } else {
                    RollDialog.run(`${this.actor.name} rolls ${skillName} (unskilled).`, "unskilled");
                }
            } else {
                dice.skillRoll(false, false, !skilled, `${this.actor.name} rolls ${skillName}.`);
            }
        }
    }

    _getSubmitData(updateData={}): any {
        let data = super._getSubmitData(updateData);

        this.readArray(data, "skills", 16);
        this.readArray(data, "complications", 4);
        this.readArray(data, "tricks", 5);
        this.readArray(data, "advances", 6);
        this.readArray(data, "flawsAndFavors", 5);
        data["data.wealth"] = parseInt(data.wealth);
        return data;
    }

    _onChangeTab(_event: MouseEvent, _tabs: Tabs, active: string) {
        if (active == "tactical") {
            super.resizeFloats($(this.form));
        }
    }
    
    readArray(data: Record<string, any>, name: { [P in keyof CharacterData]: CharacterData[P] extends string[] ? P : never }[keyof CharacterData], max: number) {        
        let array = duplicate((this.actor.data.data as CharacterData)[name]);
        while (array.length < max) {
            array.push("");
        }

        for (let i = 0; i < max; i++) {
            let arrayInput = this.form.querySelector<HTMLInputElement|HTMLTextAreaElement>(`[name=data\\.${name}\\[${i}\\]]`);
            if (arrayInput != null) {
                delete data[`data.${name}[${i}]`];
                array[i] = arrayInput.value;
            }
        }

        data[`data.${name}`] = array;
    }
}