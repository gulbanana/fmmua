import StrikeActor from "../actors/StrikeActor.js";

export default class Hit {
    actor: StrikeActor;
    damage: boolean;
    effect: boolean;
    critical: boolean;

    constructor(actor: StrikeActor, damage: boolean, effect: boolean, critical: boolean) {
        this.actor = actor;
        this.damage = damage;
        this.effect = effect;
        this.critical = critical;
    }
}