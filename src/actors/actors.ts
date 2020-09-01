import StrikeActor from "./StrikeActor.js";
import CharacterSheet from "./CharacterSheet.js";
import MonsterSheet from "./MonsterSheet.js";
import StrikeData from "./StrikeData.js";

export function init() {
    CONFIG.Actor.entityClass = StrikeActor as typeof Actor;  

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fmmua", CharacterSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("fmmua", MonsterSheet, { types: ["monster"], makeDefault: true });

    Hooks.on("updateActor", onUpdateActor);
    Hooks.on("updateToken", onUpdateToken);
}

async function onUpdateActor(entity: StrikeActor, data: ActorData<StrikeData>, _options: {render: boolean}, _userId: string) {
    if (typeof data?.data?.size === "object") {
        await entity.update({ token: data.data.size })
        for (let token of entity.getActiveTokens(true)) {
            await token.update(data.data.size);
        }
    }
}

async function onUpdateToken(_parent: Scene, _doc: TokenData, update: {_id: string, actorData: Partial<ActorData<StrikeData>>}, _options: {diff: boolean}, _userId: string) {
    if (typeof update.actorData?.data?.size === "object") {
        let token = canvas.tokens.get(update._id);
        await token.update(update.actorData.data.size);
    }
}