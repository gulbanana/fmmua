import StrikeData from "./StrikeData.js";
import PowerItem from "../items/PowerItem.js";

export default class StrikeActor extends Actor<StrikeData> {
    constructor(data: ActorData<StrikeData>, options: any) {
        super(data, options);
    }

    static async create(data: Partial<ActorData<StrikeData>>, options = {}): Promise<StrikeActor> {
        // this will be filled out later, but we want to set defaults for some of it
        (data.token as Partial<TokenData>) = data.token || {};

        if (data.type === "character") {
            mergeObject(data.token, {
                vision: true,
                dimSight: 6,
                brightSight: 0,
                actorLink: true,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            }, { overwrite: false });
            
            data.permission = data.permission || {};
            data.permission["default"] = CONST.ENTITY_PERMISSIONS.OBSERVER;
        }

        return super.create(data, options) as Promise<StrikeActor>;
    }

    getPower(powerName: string): PowerItem | null {
        let result = this.items.find((i: Item) => i.name === powerName);
        if (result instanceof PowerItem) {
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
}