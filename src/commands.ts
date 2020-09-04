import RollDialog from "./dice/RollDialog.js";
import StrikeActor from "./actors/StrikeActor.js";
import StrikeData from "./actors/StrikeData.js";
import { TraitItem, PowerItem } from "./items/items.js";

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

    for (let item of game.items.values()) {
        await item.delete();
    }

    let misfireFeature = await TraitItem.create({
        name: "Misfire!",
        data: {
            source: "class",
            description: `When you roll a 1 on any attack, do not take a Strike. Instead,
take 2 damage and the zone your bomb creates is centered
on you. Misfires are always square-shaped.`
        }
    });

    let toughnessFeat = await TraitItem.create({
        name: "Toughness",
        data: {
            source: "feat",
            description: `+3 to max HP. You Resist 1 damage against anything
other than attacks and Opportunities (e.g. against damaging
Zones or Ongoing Damage).`
        }
    });

    let meleeBasic = await PowerItem.create({
        name: "Melee Basic Attack",
        data: {
            target: "melee",
            text: `<b>Effect:</b> None.`
        }
    });

    let rangedBasic = await PowerItem.create({
        name: "Ranged Basic Attack",
        data: {
            target: "ranged",
            text: `<b>Effect:</b> None.`
        }
    });    
    
    let hero = await StrikeActor.create({
        name: "Hero", 
        type: "character",
        permission: {
            [game.users.getName("Player 2")!.id!]: CONST.ENTITY_PERMISSIONS.OWNER
        },
        data: {
            class: "Burgermeister",
            role: "Burgomeister"
        } as StrikeData
    });
    let heroData = duplicate(hero.data).token;
    let heroPosition = {x: 9*300, y: 7*300, actorLink: true};

    await Token.create(mergeObject(heroData, heroPosition, {inplace: true}));

    let villain = await StrikeActor.create({name: "Villain", type: "monster"});
    let villainData = duplicate(villain.data).token;
    let villainPosition = {x: 11*300, y: 7*300};
    await Token.create(mergeObject(villainData, villainPosition, {inplace: true}));
}