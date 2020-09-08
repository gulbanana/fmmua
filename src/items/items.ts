import StrikeActor from "../actors/StrikeActor.js";
import StrikeData from "./StrikeData.js";
import TraitData from "./TraitData.js";
import PowerData from "./PowerData.js";
import TraitSheet from "./TraitSheet.js";
import PowerSheet from "./PowerSheet.js";

export function init() {
    CONFIG.Item.entityClass = StrikeItem as typeof Item;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fmmua", TraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("fmmua", PowerSheet, { types: ["power"], makeDefault: true });

    loadTemplates(["systems/fmmua/items/power-card.html"]);
}

class StrikeItem<T extends StrikeData> extends Item<T> {
    constructor(data: ItemData<T>, actor: Actor, construct = false) {
        super(data, actor);

        if (!construct) {
            switch (data.type) {
                case "trait":
                    return new TraitItem(data, actor) as unknown as Item<T>;

                case "power":
                    return new PowerItem(data, actor) as unknown as Item<T>;
            }
        }
    }
}

export class TraitItem extends StrikeItem<TraitData> {
    constructor(data: ItemData<any>, actor: Actor) {
        super(data, actor, true);
    }

    static async create(data: Partial<ItemData<Partial<TraitData>>>, options = {}) {
        mergeObject(data, {
            type: "trait",
            img: "icons/svg/book.svg"
        }, { overwrite: false });
        return super.create(data, options);
    }
}

export class PowerItem extends StrikeItem<PowerData> {
    constructor(data: ItemData<any>, actor: Actor) {
        super(data, actor, true);
    }

    static async create(data: Partial<ItemData<Partial<PowerData>>>, options = {}) {
        mergeObject(data, {
            type: "power",
            img: "icons/svg/dice-target.svg"
        }, { overwrite: false });
        return super.create(data, options);
    }

    prepareData() {
        super.prepareData();
        
        const itemData = this.data;
        const powerData = itemData.data;

        switch (powerData.action) {     
            case "free":
                powerData.actionIcon = "circle";
                break;

            case "attack":
                powerData.actionIcon = "swords";
                break;

            case "role":
                powerData.actionIcon = "users";
                break;   

            case "move":            
                powerData.actionIcon = "running";
                break;

            case "reaction":
            case "interrupt":
                powerData.actionIcon = "bolt";
                break;
        }

        switch (powerData.usage) {
            case "at-will":
                powerData.usageText = "At-Will";
                break;

            case "encounter":
                powerData.usageText = "Encounter";
                break;

            case "custom":
                powerData.usageText = powerData.customType || "Custom";
                break;
        }

        powerData.hasTarget = typeof powerData.target === "string";
        powerData.hasRange = powerData.target !== "melee";
        switch (powerData.target) {     
            case "melee":
                powerData.rangeIcon = "axe";
                break;

            case "ranged":
                powerData.rangeIcon = "bow-arrow";
                break;

            case "burst":
                powerData.rangeIcon = "bullseye";
                break;
        }

        powerData.hasDamage = powerData.action === "attack" && typeof powerData.damage === "number" && powerData.damage > 0;

        if (powerData.customSubtype != null) {
            powerData.subtypeText = powerData.customSubtype;
        } else if (powerData.action === "free") {
            powerData.subtypeText = "Free Action";
        } else if (powerData.action === "reaction") {
            powerData.subtypeText = "Reaction";
        } else if (powerData.action === "interrupt") {
            powerData.subtypeText = "Interrupt";
        } else if (powerData.action === "none") {
            powerData.subtypeText = "No Action";
        }

        if ((powerData.source === "class" || powerData.source === "role") && powerData.usage !== "custom") {
            (powerData.kind as string) = powerData.source + "-" + powerData.usage;
        } else {
            powerData.kind = "other";
        }        
    }

    async use(actor: StrikeActor): Promise<void> {
        let content = await renderTemplate("systems/fmmua/items/power-card.html", this.data)
        let speaker = ChatMessage.getSpeaker({ actor });
        await ChatMessage.create({ content, speaker });
    }
}