import { StrikeData } from "./actors.js";

export default class StrikeActor extends Actor<StrikeData> {
    constructor(data: ActorData<StrikeData>, options: any) {
        super(data, options);
    }
}