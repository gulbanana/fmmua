import * as dice from "../dice/dice.js";
import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";
import Target from "./Target.js";
import Hit from "./Hit.js";

export default interface MacroAPI {
    dice: typeof dice;
    
    token: Token;
    actor: StrikeActor;    
    power: StrikeItem;
    
    /**
     * Allows the user to select targets for a power.
     * @param count Maximum number of targets. Default: Unlimited within a Burst, 1 otherwise.
     * @param range Maximum distance to each target. Default: Calculated based on power Range and Burst Size.
     */
    pickTargets(options: {count: number, range: number}): Promise<Target[]>;

    /**
     * Makes attack rolls and returns the hit state (missed, glancing, solid, critical) of each target.
     * @param targets A list of tokens to attack, with optional advantage/disadvantage. Default: The targets returned from a call to pickTargets().
     */
    rollAttacks(targets?: Target[]): Promise<Hit[]>;

    /**
     * 
     * @param damage How much damage to deal. Default: The power's damage (this.damage).
     * @param hits A list of actor hits to which to potentially deal damage. Default: The hits returned from a call to rollAttacks().
     */
    applyDamage(damage?: number, hits?: Hit[]): Promise<void>;

    /**
     * 
     * @param effects The special effects to apply. Default: none.
     * @param hits A list of actor hits to which to potentially apply effects. Default: The hits returned from a call to rollAttacks().
     */
    applyEffect(effects: {}, hits?: Hit[]): Promise<void>;
}