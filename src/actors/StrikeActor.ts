import StrikeItem from "../items/StrikeItem.js";
import StrikeItemData from "../items/StrikeItemData.js";
import StrikeActorData from "./StrikeActorData.js";
import CharacterData from "./CharacterData.js";
import MonsterData from "./MonsterData.js";
import { execute } from "../macros/macros.js";

export default class StrikeActor extends Actor<Actor.Data<StrikeActorData, Item.Data<StrikeItemData>>, StrikeItem> {
    constructor(data?: DeepPartial<Actor.Data<StrikeActorData, Item.Data<StrikeItemData>>>, options?: Entity.CreateOptions) {
        super(data, options);
    }

    static async create(data: any, options: any = {}): Promise<StrikeActor> {
        // this will be filled out later, but we want to set defaults for some of it
        (data as any).token = data.token || {};

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
                let commonPowersPack = game.packs!.get("fmmua.commonPowers") as Compendium;
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
        if (data.type === "character" || !game.user!.isGM) {
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

        return super.create(data, options) as unknown as Promise<StrikeActor>;
    }

    // workaround 0.7.9 change where the data of owned items is duplicate()d, 
    // meaning their derived data isn't visible in actor.data
    prepareData() {
        super.prepareData();
        this.data.items = Array.from(this.items.values()).map(i => duplicate(i.data)) as any;
        this.data.effects = Array.from(this.getEmbeddedCollection("ActiveEffect").values()).map(e => duplicate(e)) as any;
    }

    getPower(name: string): StrikeItem | null {
        let result = this.items.find(i => i.name === name) ?? null;
        if (result != null && result.type == "power") {
            return result;
        } else {
            return null;
        }
    }

    async display(traitOrPower: string | StrikeItem | null): Promise<void> {
        if (typeof traitOrPower == "string") {
            traitOrPower = this.items.find(i => i.name === traitOrPower) ?? null;
        }

        if (traitOrPower != null) {
            let content = await traitOrPower.render();
            let speaker = ChatMessage.getSpeaker({ actor: this as any });
            await ChatMessage.create({
                content,
                speaker,
                flags: {"core.canPopout": true}
            } as any);
        }
    }

    async use(power: string | StrikeItem | null): Promise<void> {
        if (!this.owner) {
            ui.notifications.error(game.i18n.localize("fmmua.errors.ActorIsNotOwned"));
            return;
        }

        if (typeof power == "string") {
            power = this.getPower(power);
        }
        
        if (power == null) {
            let error = game.i18n.format("fmmua.error.PowerNotFound", {
                actor: this.name,
                power: power
            });
            ui.notifications.warn(error);
            return;
        }

        if (power.type != "power") {
            ui.notifications.error(game.i18n.localize("fmmua.errors.ItemIsNotPower"));
            return;
        }

        await execute(this, power);
    }
}