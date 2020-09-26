import * as dice from "../dice/dice.js";
import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";
import Target from "./Target.js";

export default interface MacroAPI {
    dice: typeof dice;
    
    token: Token;
    actor: StrikeActor;    
    power: StrikeItem;
    
    pickTargets(): Promise<Target[]>;
    rollAttacks(targets: Target[]): Promise<void>;
}