import { StrikeData } from "./actors.js";

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
        }

        return super.create(data, options) as Promise<StrikeActor>;
    }
}