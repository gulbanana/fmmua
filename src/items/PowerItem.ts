import PowerData from "./PowerData.js";
import StrikeActor from "../actors/StrikeActor.js";

export default class PowerItem extends Item<PowerData> {
    async use(actor: StrikeActor): Promise<void> {
        await ChatMessage.create({
            content: `${actor.name} uses power ${this.name}.`
        });
    }
}