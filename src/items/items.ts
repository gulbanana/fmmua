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

    async use(actor: StrikeActor): Promise<void> {
        await ChatMessage.create({
            content: `${actor.name} uses power ${this.name}.`
        });
    }
}