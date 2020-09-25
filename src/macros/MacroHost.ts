import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";
import MacroAPI from "./MacroAPI";

export default class MacroHost implements MacroAPI {
    token: Token;
    actor: StrikeActor;
    power: StrikeItem;

    constructor(actor?: StrikeActor, power?: StrikeItem) {
        if (actor && power) {
            let speaker = ChatMessage.getSpeaker({ actor });
            this.actor = actor;
            this.token = canvas.tokens.get(speaker.token);
            this.power = power;
        } else {
            this.actor = undefined as any;
            this.token = undefined as any;
            this.power = undefined as any;
        }
    }

    pickTargets(x: string) {
        
    }

    rollAttacks(y: number) {
        
    }
}