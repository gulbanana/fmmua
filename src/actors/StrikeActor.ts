import StrikeActorData from "./StrikeActorData.js";
import StrikeItem from "../items/StrikeItem.js";
import * as dice from "../dice/dice.js";
import StrikeItemData from "../items/StrikeItemData.js";

export default class StrikeActor extends Actor<StrikeActorData> {
    constructor(data: ActorData<StrikeActorData>, options: any) {
        super(data, options);
    }

    static async create(data: Partial<ActorData<StrikeActorData> & { items: ItemData<StrikeItemData>[] }>, options = {}): Promise<StrikeActor> {
        // this will be filled out later, but we want to set defaults for some of it
        (data.token as Partial<TokenData>) = data.token || {};

        // has tactical template
        if (data.type === "character" || data.type === "monster") {
            mergeObject(data.token, {
                displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS, // XXX or maybe Hover?
                bar1: {
                    attribute: "hp"
                }
            }, { overwrite: false });
        }

        if (data.type === "character") {
            mergeObject(data.token, {
                vision: true,
                dimSight: 6,
                brightSight: 0,
                actorLink: true,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
            }, { overwrite: false });
            
            data.permission = data.permission || {};
            data.permission["default"] = CONST.ENTITY_PERMISSIONS.OBSERVER;
            
            if (!data.items) {
                let commonPowersPack = game.packs.get("fmmua.commonPowers") as Compendium;
                let commonPowers = await commonPowersPack.getContent() as Item[];
                data.items = commonPowers.map(item => item.data);
            }
        } else if (data.type === "monster") {
            mergeObject(data.token, {
                disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE
            }, { overwrite: false });
        }

        return super.create(data, options) as Promise<StrikeActor>;
    }

    getOwnedItem(itemId: string): StrikeItem | null {
        return super.getOwnedItem(itemId) as StrikeItem | null;
    }

    getPower(name: string): StrikeItem | null {
        let result = this.items.find((i: Item) => i.name === name) as StrikeItem | null;
        if (result != null && result.type == "power") {
            return result;
        } else {
            return null;
        }
    }

    async use(powerName: string): Promise<void> {
        let power = this.getPower(powerName);
        if (power == null) {
            let error = game.i18n.format("fmmua.error.PowerNotFound", {
                actor: this.name,
                power: powerName
            });
            ui.notifications.warn(error);
            return;
        }

        await power.use(this);
    }

    async display(name: string): Promise<void> {
        let traitOrPower = this.items.find((i: Item) => i.name === name) as StrikeItem | null;
        if (traitOrPower != null) {
            await traitOrPower.display(this);
        }
    }

    rollAttack({advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.attackRoll(advantage || false, disadvantage || false, `${this.name} rolls to hit.`);
    }

    rollSavingThrow({advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.savingThrow(advantage || false, disadvantage || false, `${this.name} rolls to save.`);
    }

    rollSkill(name: string, {advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.skillRoll(advantage || false, disadvantage || false, false, `${this.name} rolls ${name}.`);
    }

    rollUnskilled(name: string, {advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.skillRoll(advantage || false, disadvantage || false, true, `${this.name} rolls ${name} (unskilled).`);
    }
}