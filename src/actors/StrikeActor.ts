import * as dice from "../dice/dice.js";
import StrikeItem from "../items/StrikeItem.js";
import StrikeItemData from "../items/StrikeItemData.js";
import StrikeActorData from "./StrikeActorData.js";
import CharacterData from "./CharacterData.js";
import MonsterData from "./MonsterData.js";
import Target from "../macros/Target.js";
import Hit from "../macros/Hit.js";

export default class StrikeActor extends Actor<StrikeActorData> {
    constructor(data: ActorData<StrikeActorData>, options: any) {
        super(data, options);
    }

    static async create(data: Partial<ActorData<StrikeActorData> & { items: ItemData<StrikeItemData>[] }>, options = {}): Promise<StrikeActor> {
        // this will be filled out later, but we want to set defaults for some of it
        (data.token as Partial<TokenData>) = data.token || {};

        // has tactical template
        if (data.type === "character" || data.type === "monster") {
            mergeObject(data.token, {
                displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
                displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
                bar1: {
                    attribute: "hp"
                }
            }, { overwrite: false });
        }

        // defaults for PCs only
        if (data.type === "character") {
            data.name = data.name || "New Character";
            mergeObject(data.token, {
                actorLink: true
            }, { overwrite: false });
                        
            if (!data.items) {
                let commonPowersPack = game.packs.get("fmmua.commonPowers") as Compendium;
                let commonPowers = await commonPowersPack.getContent() as Item[];
                data.items = commonPowers.map(item => item.data);
            }
        } else if (data.type === "monster") {
            data.name = data.name || "New Monster";
            mergeObject(data.token, {
                actorLink: false
            }, { overwrite: false });
        }

        // defaults for both PCs and owned monsters 
        if (data.type === "character" || !game.user.isGM) {
            mergeObject(data.token, {
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                vision: true,
                dimSight: 6,
                brightSight: 0
            }, { overwrite: false });

            data.permission = data.permission || {};
            data.permission["default"] = CONST.ENTITY_PERMISSIONS.OBSERVER;
        } else if (data.type === "monster") {
            mergeObject(data.token, {
                disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE
            }, { overwrite: false });
        }

        return super.create(data, options) as Promise<StrikeActor>;
    }

    // prepareData() {
    //     super.prepareData();
    //     if (this.data.type == "character") {
    //         let characterData = this.data.data as CharacterData;
    //     }
    // }

    get character(): CharacterData {
        return this.data.data as CharacterData;
    }

    get monster(): MonsterData {
        return this.data.data as MonsterData;
    }

    getOwnedItem(itemId: string): StrikeItem | null {
        return super.getOwnedItem(itemId) as StrikeItem | null;
    }

    getPower(name: string): StrikeItem | null {
        let result = this.items.find((i: Item) => i.name === name) as StrikeItem | null;
        if (result != null && result.type == "power") {
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

    async display(name: string): Promise<void> {
        let traitOrPower = this.items.find((i: Item) => i.name === name) as StrikeItem | null;
        if (traitOrPower != null) {
            await traitOrPower.display(this);
        }
    }

    async pickTarget(): Promise<Target[]> {
        let result = [];
        let t = canvas.tokens.placeables.find(t => t.name == "Villain");
        if (t) result.push(new Target(t, false, false));
        return result;
    }

    async rollAttacks(targets: Target[]): Promise<Hit[]> {
        let hits: Hit[] = [];
        for (let target of targets) {
            let result = await dice.attackRoll(target.advantage, target.disadvantage, `${this.name} rolls to hit ${target.token.actor.name}.`);
            hits.push(new Hit(target.token.actor as StrikeActor, result > 2, result > 3, result == 6));
        }
        return hits;
    }

    rollSavingThrow({advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.savingThrow(advantage || false, disadvantage || false, `${this.name} rolls to save.`);
    }

    rollSkill(name: string, {advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.skillRoll(advantage || false, disadvantage || false, false, `${this.name} rolls ${name}.`);
    }

    rollUnskilled(name: string, {advantage, disadvantage}: {advantage?: boolean, disadvantage?: boolean} = {}) {
        return dice.skillRoll(advantage || false, disadvantage || false, true, `${this.name} rolls ${name} (unskilled).`);
    }
}