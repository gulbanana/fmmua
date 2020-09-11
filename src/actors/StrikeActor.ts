import StrikeActorData from "./StrikeActorData.js";
import StrikeItem from "../items/StrikeItem.js";

export default class StrikeActor extends Actor<StrikeActorData> {
    constructor(data: ActorData<StrikeActorData>, options: any) {
        super(data, options);
    }

    static async create(data: Partial<ActorData<StrikeActorData>>, options = {}): Promise<StrikeActor> {
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
}