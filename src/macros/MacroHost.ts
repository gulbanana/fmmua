import * as dice from "../dice/dice.js";
import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";
import MacroAPI from "./MacroAPI";
import Target from "./Target.js";

export default class MacroHost implements MacroAPI {
    _committed: boolean;  
    dice: typeof dice;    
    token: Token;
    actor: StrikeActor;
    power: StrikeItem;    

    constructor(actor?: StrikeActor, power?: StrikeItem) {
        this._committed = false;
        this.dice = dice;

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

    
    async pickTargets(): Promise<Target[]> {
        let result = [];
        let t = canvas.tokens.placeables.find(t => t.name == "Villain");
        if (t) result.push(new Target(t, false, false));
        return result;
    }

    async rollAttacks(targets: Target[]): Promise<void> {
        if (targets.length) {
            await this._commit();
        }

        for (let target of targets) {
            let result = await dice.attackRoll(target.advantage, target.disadvantage, `${this.actor.name} rolls to hit ${target.token.actor.name}.`);
            //hits.push(new Hit(target.token.actor as StrikeActor, result > 2, result > 3, result == 6));
        }
    }

    async _commit() {
        if (!this._committed) {
            this._committed = true;
            await this.actor.display(this.power);
        }
    }
}