import CharacterData from "./CharacterData.js";
import StrikeItemData from "../items/StrikeItemData.js";
import PowerData from "../items/PowerData.js";
import StrikeActorSheet from "./StrikeActorSheet.js";

type SheetData = ActorSheetData<CharacterData> & {
    feats: ItemData<StrikeItemData>[];
    role: ItemData<StrikeItemData>[]
    class: ItemData<StrikeItemData>[];
    
    ungroupedPowers: boolean;
    powers: ItemData<PowerData>[];
    
    groupedPowers: boolean;
    otherPowers: ItemData<PowerData>[];
    rolePowers: ItemData<PowerData>[];
    classPowers: ItemData<PowerData>[];    
};

export default class CharacterSheet extends StrikeActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 1000,
            height: 700,
            template: "systems/fmmua/actors/CharacterSheet.html"
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

    activatedTactical: boolean = false;
    activeTab: string = "adventure";

    activateListeners(html: JQuery) {
        this.activatedTactical = false;
        super.activateListeners(html, true);

        let tabs = new Tabs({
            navSelector: ".tab-headers", 
            contentSelector: ".tab-content",
            initial: this.activeTab,
            callback: this.onChangeTab.bind(this)
        });

        tabs.bind(html[0]);

        this.onChangeTab(null, tabs, tabs.active);
    }

    activateTacticalListeners(html: JQuery) {
        super.activateTacticalListeners(html);

        if (this._canDragStart(".item.power")) {
            let handler = (ev: DragEvent) => this._onDragStart(ev);
            html.find('.item.power').each((_index, div) => {
              div.setAttribute("draggable", "true");
              div.addEventListener("dragstart", handler, false);
            });
        }
    }

    onChangeTab(_: unknown, _tabs: Tabs, active: string) {
        this.activeTab = active;
        if (!this.activatedTactical && active === "tactical") {
            this.activateTacticalListeners($(this.form));
            this.activatedTactical = true;
        }
    }

    _getSubmitData(updateData={}): any {
        let data = super._getSubmitData(updateData);
        let actorData = (this.actor.data.data as CharacterData);

        this.readArray(data, "skills", 16);
        this.readArray(data, "complications", 4);
        this.readArray(data, "tricks", 5);

        return data;
    }
    
    readArray(data: Record<string, any>, name: { [P in keyof CharacterData]: CharacterData[P] extends string[] ? P : never }[keyof CharacterData], max: number) {        
        let array = duplicate(this.actor.character[name]);
        while (array.length < max) {
            array.push("");
        }

        for (let i = 0; i < max; i++) {
            let arrayInput = this.form.querySelector<HTMLInputElement>(`input[name=data\\.${name}\\[${i}\\]]`);
            if (arrayInput != null) {
                delete data[`data.${name}[${i}]`];
                array[i] = arrayInput.value;
            }
        }

        data[`data.${name}`] = array;
    }
}