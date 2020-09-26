import * as dice from "../dice/dice.js";
import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";
import MacroAPI from "./MacroAPI";
import Target from "./Target.js";
import Hit from "./Hit.js";
import PowerData from "../items/PowerData.js";
import Cancellation from "./Cancellation.js";

export default class MacroHost implements MacroAPI {
    dice: typeof dice;

    token: Token;
    actor: StrikeActor;
    power: StrikeItem; 

    constructor(actor?: StrikeActor, power?: StrikeItem) {
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

    _promises: Promise<any>[] = [];
    async _seq<T, P extends any[]>(f: (...args: P) => Promise<T>, ...args: P): Promise<T> {
        for (let pending of this._promises) {
            await pending;
        }

        //@ts-ignore
        let g = f.bind(this);
        let nextPromise = g(...args);

        this._promises.push(nextPromise);

        try {
            return await nextPromise;
        }
        catch (err) {
            // i solemnly swear to handle this rejection
            err.deferred = true;
            throw err;
        }
    }

    async _drain() {
        for (let pending of this._promises) {
            await pending;
        }
    }

    payCost = (resource: string, amount?: number) => this._seq(this._payCost, resource, amount);
    async _payCost(resource: string, amount: number = 1) {
        let value = getProperty(this.actor.data.data, resource);
        if (typeof value != "number") {
            value = getProperty(this.actor.data.data, resource + ".value");
            if (typeof value != "number") {
                ui.notifications.error(`Numeric value @${resource} not found in actor ${this.actor.name}. See the console (F12) for a list of available actor values.`);
                console.log(`Actor values for ${this.actor.name}:`, this.actor.data.data);
                throw new Cancellation();
            }
            resource = resource + ".value";
        }

        if (value < amount) {
            ui.notifications.warn(`Actor ${this.actor.name} has @${resource}=${value}, and cannot pay ${amount}.`);
            throw new Cancellation();
        }

        await this.actor.update({
            ["data." + resource]: value - amount
        });
        this._note(this.actor.name, `@${resource} -${amount}`);
    }
    
    _lastTargets?: Target[];
    pickTargets = (options: {count?: number, range?: number} = {}) => this._seq(this._pickTargets, options);
    async _pickTargets(options: {count?: number, range?: number} = {}): Promise<Target[]> {
        let targets = [];
        let token = canvas.tokens.placeables.find(t => t.name == "Villain");
        if (token) {
            targets.push(new Target(token, false, false));
        }

        this._lastTargets = targets;
        return targets;
    }

    _lastHits?: Hit[];
    rollAttacks = (targets?: Target[]) => this._seq(this._rollAttacks, targets);
    async _rollAttacks(targets?: Target[]): Promise<Hit[]> {
        if (!targets) {
            targets = this._lastTargets || [];
        }

        if (targets.length) {
            await this._commit();
        }

        let hits: Hit[] = [];
        for (let target of targets) {
            let result = await dice.attackRoll(target.advantage, target.disadvantage, `${this.actor.name} rolls to hit ${target.token.actor.name}.`);
            hits.push(new Hit(target.token.actor as StrikeActor, result > 2, result > 3, result == 6));
        }

        this._lastHits = hits;
        return hits;
    }

    applyDamage = (damage?: number, hits?: Hit[]) => this._seq(this._applyDamage, damage, hits);
    async _applyDamage(damage?: number, hits?: Hit[]) {
        if (!hits) {
            hits = this._lastHits || [];
        }

        if (typeof damage != "number") {
            damage = (this.power.data.data as PowerData).damage;
        }

        if (typeof damage == "number") {
            for (let hit of hits) {
                if (hit.damage) {
                    let x = hit.critical ? damage * 2 : damage;
                    await hit.actor.update({
                        "data.hp.value": (this.actor.data.data.hp.value - x)
                    });
                    this._note(hit.actor.name, `takes ${x} damage`);
                }
            }
        }
    }

    applyEffect = (effects: {}, hits?: Hit[]) => this._seq(this._applyEffect, effects, hits);
    async _applyEffect(effects: {}, hits?: Hit[]) {
        if (!hits) {
            hits = this._lastHits || [];
        }

        let content = "Applying effects: " + JSON.stringify(effects);
        let speaker = ChatMessage.getSpeaker({ actor: this.actor });
        await ChatMessage.create({ content, speaker });
    }

    _committed: boolean = false;   
    async _commit() {
        if (!this._committed) {
            this._committed = true;
            await this.actor.display(this.power);
        }
    }

    _results: Record<string, string[]> = {};
    _note(key: string, value: string) {
        if (!this._results[key]) {
            this._results[key] = [];
        }

        this._results[key].push(value);
    }

    async _toMessage() {
        if (this._results && Object.getOwnPropertyNames(this._results).length) {
            let content = JSON.stringify(this._results);
            let speaker = ChatMessage.getSpeaker({ actor: this.actor });
            await ChatMessage.create({ content, speaker });
        }
    }
}