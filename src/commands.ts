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

    let openingFeature = await TraitItem.create({
        name: "Find an opening",
        data: {
            source: "class",
            description: "When you attack the target of your Duel, you may spend any number of points of its Focus. If you hit, increase your damage by one per point spent."
        }
    });

    let rallyPower = await PowerItem.create({
        name: "Rally",
        data: {
            action: "none",
            usage: "encounter",
            text: `<p><b>Special:</b> You may only use this on your turn, but you may use at any point in your turn, even while Incapacitated, Dominated, or under any other Status.</p>
<p>Spend an Action Point. Regain 4 Hit Points and regain the use of one Encounter Power from your Class (i.e. not a Role Action) you have expended.</p>`
        }
    });
    
    let meleeBasicPower = await PowerItem.create({
        name: "Melee Basic Attack",
        data: {
            target: "melee",
            range: 1,
            text: "<p><b>Effect:</b> None.</p>"
        }
    });


    let gohPower = await PowerItem.create({
        name: "Get Over Here",
        data: {
            source: "class",
            target: "ranged",
            range: 5,
            text: "<p><b>Effect:</b> Target is pulled to an adjacent square.</p>"
        }
    });

    let markPower = await PowerItem.create({
        name: "Mark",
        data: {
            source: "role",
            action: "role",
            target: "ranged",
            range: 5,
            text: `<p>Target is Marked by you until the end of its next turn.</p>
<p>(At level 4, Mark two targets in range. At level 8, three targets.)</p>`
        }
    });

    let duelPower = await PowerItem.create({
        name: "Duel",
        data: {
            source: "class",            
            action: "free",
            usage: "encounter",
            text: `<p>Target one creature within 10 squares. Until the end of the encounter, when you attack the target, any 2s on your dice are treated as though they were 4s (6s at level 5).</p>
<p><b>Special:</b> This power recharges when its target is Taken Out.</p>`
        }
    });

    let changePower = await PowerItem.create({
        name: "Change Target",
        data: {
            source: "class",            
            action: "attack",
            usage: "at-will",
            text: `<p>Make a Basic Attack against a creature. Then change the target of Duel to that creature.</p>
<p><b>Clarification:</b> If you make this attack multiple times at once (for instance, as a Blaster), you may choose which target to change your Duel to after resolving the attacks. You may only ever have one target of Duel.</p>`
        }
    });

    let cagiPower = await PowerItem.create({
        name: "Come and Get It!",
        data: {
            source: "role",
            action: "role",
            usage: "encounter",
            target: "burst",
            range: 2,
            text: `<p>You pull every enemy in the zone to a square adjacent to you. Mark any or all of them until the end of your next turn.</p>`
        }
    });

    let pdPower = await PowerItem.create({
        name: "Perfect Defense",
        data: {
            source: "class",
            action: "attack",
            usage: "encounter",
            target: "melee",
            range: 1,
            damage: 3,
            text: `<p><b>Effect:</b> Target has Disadvantage to attack you. It makes a Saving Throw against this Status each time it hits you with an attack.</p>`
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

    await hero.createOwnedItem(toughnessFeat);
    await hero.createOwnedItem(rallyPower);
    await hero.createOwnedItem(meleeBasicPower);
    //await hero.createOwnedItem(openingFeature);    
    await hero.createOwnedItem(duelPower);
    await hero.createOwnedItem(pdPower);    
    await hero.createOwnedItem(changePower);
    await hero.createOwnedItem(gohPower);
    //await hero.createOwnedItem(stickinessBoost);    
    await hero.createOwnedItem(cagiPower);
    await hero.createOwnedItem(markPower);    

    await Token.create(mergeObject(heroData, heroPosition, {inplace: true}));

    let villain = await StrikeActor.create({name: "Villain", type: "monster"});
    let villainData = duplicate(villain.data).token;
    let villainPosition = {x: 11*300, y: 7*300};
    await Token.create(mergeObject(villainData, villainPosition, {inplace: true}));
}