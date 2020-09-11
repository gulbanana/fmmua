import StrikeItemData from "./StrikeItemData.js";
import PowerData from "./PowerData.js";
import StrikeActor from "../actors/StrikeActor.js";
import TraitData from "./TraitData.js";

export default class StrikeItem extends Item<StrikeItemData> {
    static create(data: Partial<ItemData<Partial<StrikeItemData>>>, options = {}) {
        data.name = data.name || undefined;
        switch (data.type) {
            case "trait":
                mergeObject(data, {
                    name: "New Trait",
                    img: "icons/svg/book.svg"
                }, { overwrite: false });
                break;
        
            case "power":
                mergeObject(data, {
                    name: "New Power",
                    img: "icons/svg/dice-target.svg"
                }, { overwrite: false });
                break;
        }

        return super.create(data, options) as Promise<StrikeItem>;
    }

    static createPower(data: Partial<ItemData<Partial<PowerData>>>, options = {}) {
        return this.create(mergeObject(data, {
            type: "power"
        }), options);
    }

    static createTrait(data: Partial<ItemData<Partial<PowerData>>>, options = {}) {
        return this.create(mergeObject(data, {
            type: "trait"
        }), options);
    }

    prepareData() {
        super.prepareData();

        switch (this.type) {
            case "power":
                this.preparePowerData();
                break;

            case "trait":
                this.prepareTraitData();
                break;
        }
    }

    preparePowerData() {        
        const itemData = this.data;
        const powerData = itemData.data as PowerData;

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

    prepareTraitData() {        
        const itemData = this.data;
        const traitData = itemData.data as TraitData;

        switch (traitData.source) {
            case "class":
                traitData.kind = "class-feature";
                traitData.kindText = "Class Feature";
                break;

            case "role":
                traitData.kind = "role-boost";
                traitData.kindText = "Role Boost";
                break;

            case "feat":
                traitData.kind = "other";
                traitData.kindText = "Feat";
                break;

            default:
                traitData.kind = "other";
                traitData.kindText = "Trait";
        }
    }

    async display(actor: StrikeActor): Promise<void> {
        let content = await renderTemplate(this.type == "power" ? "systems/fmmua/items/PowerCard.html" : "systems/fmmua/items/TraitCard.html", this.data)
        let speaker = ChatMessage.getSpeaker({ actor });
        await ChatMessage.create({ content, speaker });
    }

    // XXX this one should do targetting and run macros
    async use(actor: StrikeActor): Promise<void> {
        if (this.type != "power") {
            ui.notifications.error(game.i18n.localize("fmmua.errors.ItemIsNotPower"));
            return;
        }

        let content = await renderTemplate("systems/fmmua/items/PowerCard.html", this.data)
        let speaker = ChatMessage.getSpeaker({ actor });
        await ChatMessage.create({ content, speaker });
    }
}