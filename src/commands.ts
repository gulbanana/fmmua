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
            description: "When you roll a 1 on any attack, do not take a Strike. Instead, take 2 damage and the zone your bomb creates is centered on you. Misfires are always square-shaped."
        }
    });

    let toughnessFeat = await TraitItem.create({
        name: "Toughness",
        data: {
            source: "feat",
            description: "+3 to max HP. You Resist 1 damage against anything other than attacks and Opportunities (e.g. against damaging Zones or Ongoing Damage)."
        }
    });

    let stickinessBoost = await TraitItem.create({
        name: "Stickiness Boost",
        data: {
            source: "role",
            description: "When an enemy grants you an Opportunity, it takes 1 additional damage."
        }
    });

    let meleeBasicPower = await PowerItem.create({
        name: "Melee Basic Attack",
        data: {
            target: "melee",
            text: "<b>Effect:</b> None."
        }
    });

    let grenadePower = await PowerItem.create({
        name: "Get Over Here",
        data: {
            source: "class",
            target: "ranged",
            range: 5,
            text: "<b>Effect:</b> Target is pulled to an adjacent square."
        }
    });

    let markPower = await PowerItem.create({
        name: "Mark",
        data: {
            source: "role",
            action: "role",
            target: "ranged",
            range: 5,
            text: `Target is Marked by you until the end of its next turn.
(At level 4, Mark two targets in range. At level 8, three targets.)`
        }
    });

    let rallyPower = await PowerItem.create({
        name: "Rally",
        data: {
            action: "move",
            usage: "encounter",
            text: ``
        }
    });
    
    let hero = await StrikeActor.create({
        name: "Hero", 
        type: "character",
        permission: {
            [game.users.getName("Player 2")!.id!]: CONST.ENTITY_PERMISSIONS.OWNER
        },
        data: {
            class: "Duelist",
            role: "Defender"
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