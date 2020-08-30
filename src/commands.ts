import RollDialog from "./dice/RollDialog.js";
import StrikeActor from "./actors/StrikeActor.js";

interface ChatData {
    user: string;
    speaker: {
        scene: string;
        actor: string;
        token: string;
        alias: string;
    }
}

export function init() {
    Hooks.on("chatMessage", (_chatLog: any, content: string, data: ChatData) => {
        let parts = content.split(" ");
        let command = parts[0];
        if (command == "/sroll")
        {
            sroll(data, content.substring(7));
            return false;
        } else if (command == "/reset") {
            reset();
            return false;
        }
    });    
}

function sroll(_data: ChatData, flavor: string) {
    setTimeout(() => RollDialog.run(flavor));
}

// debug
async function reset() {
    let scene = game.scenes.getName("Scene")!;
    let tokens = scene.getEmbeddedCollection("Token");

    for (let token of tokens) {        
        await scene.deleteEmbeddedEntity("Token", token._id);
    }

    for (let actor of game.actors.values()) {
        await actor.delete();
    }

    let hero = await StrikeActor.create({name: "Hero", type: "character"});
    let heroData = duplicate(hero.data).token;
    let heroPosition = {x: 9*300, y: 7*300, actorLink: true};
    await Token.create(mergeObject(heroData, heroPosition, {inplace: true}));

    let villain = await StrikeActor.create({name: "Villain", type: "monster"});
    let villainData = duplicate(villain.data).token;
    let villainPosition = {x: 11*300, y: 7*300, actorLink: true};
    await Token.create(mergeObject(villainData, villainPosition, {inplace: true}));
}