import StrikeActor from "../actors/StrikeActor.js";
import StrikeData from "./StrikeData.js";
import FeatData from "./FeatData.js";
import PowerData from "./PowerData.js";
import FeatSheet from "./FeatSheet.js";
import PowerSheet from "./PowerSheet.js";

export function init() {
    CONFIG.Item.entityClass = StrikeItem as typeof Item;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fmmua", FeatSheet, { types: ["feat"], makeDefault: true });
    Items.registerSheet("fmmua", PowerSheet, { types: ["power"], makeDefault: true });
}

class StrikeItem<T extends StrikeData> extends Item<T> {
    constructor(data: ItemData<T>, actor: Actor, construct = false) {
        super(data, actor);

        if (!construct) {
            switch (data.type) {
                case "feat":
                    return new FeatItem(data, actor) as unknown as Item<T>;

                case "power":
                    return new PowerItem(data, actor) as unknown as Item<T>;
            }
        }
    }
}

export class FeatItem extends StrikeItem<FeatData> {
    constructor(data: ItemData<any>, actor: Actor) {
        super(data, actor, true);
    }

    static async create(data: Partial<ItemData<Partial<FeatData>>>, options = {}) {
        mergeObject(data, {
            type: "feat"
        });
        return super.create(data, options);
    }
}

export class PowerItem extends StrikeItem<PowerData> {
    constructor(data: ItemData<any>, actor: Actor) {
        super(data, actor, true);
    }

    static async create(data: Partial<ItemData<Partial<PowerData>>>, options = {}) {
        mergeObject(data, {
            type: "power"
        });
        return super.create(data, options);
    }

    async use(actor: StrikeActor): Promise<void> {
        await ChatMessage.create({
            content: `${actor.name} uses power ${this.name}.`
        });
    }
}