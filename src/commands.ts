import RollDialog from "./dice/RollDialog.js";
import StrikeActor from "./actors/StrikeActor.js";
import StrikeActorData from "./actors/StrikeActorData.js";
import GlossaryWindow from "./glossary/GlossaryWindow.js";
import glossaryCategories from "./glossary/categories.js";
import StrikeItem from "./items/StrikeItem.js";

interface ChatData {
    user: string;
    speaker: {
        scene: string;
        actor: string;
        token: string;
        alias: string;
    }
}

type Command = {
    param?: string,
    help: string,
    f: (data: ChatData, params: string) => void
}

let commands: Record<string, Command> = {
    "/shelp": {
        f: (data) => {
            let helpText = "<h3>Strike Commands</h3><table>";
            for (let commandName in commands) {
                let command = commands[commandName];
                let invoke = `<i>${commandName}</i>`;
                if (command.param) {
                    invoke = invoke + ` &lt;${command.param}&gt;`;
                }
                helpText += `<tr><td>${invoke}</td><td>${command.help}</td></tr>\n`;
            }
            helpText += "</table>";
            ChatMessage.create({ 
                content: helpText, 
                speaker: data.speaker, 
                whisper: [game.user]
            });
        },
        help: "List available commands.",
    },
    "/sroll": {
        param: "flavor",
        f: (_data, flavor) => {
            setTimeout(() => RollDialog.run(flavor));
        },
        help: "Roll Strike dice with semantic results."
    },
    "/sglossary": {
        param: "entry",
        f: (_data, entry) => {
            let displayName = "Ally";
            if (entry.length > 0) {
                let entries = glossaryCategories.flatMap(c => c.entries);
                for (let e of entries) {
                    if (entry == e.displayName || (e.pattern != null && ` ${entry} `.match(e.pattern))) {
                        displayName = e.displayName;
                        break;
                    }
                }
            }
            new GlossaryWindow(displayName).render(true);
        },
        help: "Display rules text for a search term."
    },
    "/reset": {
        f: () => {
            reset();
        },
        help: "debug only - do not use"
    }
}

export function init() {
    Hooks.on("chatMessage", (_chatLog: any, content: string, data: ChatData) => {
        let parts = content.split(" ");
        let commandName = parts[0];
        if (Object.getOwnPropertyNames(commands).includes(commandName)) {
            let command = commands[commandName];
            command.f(data, content.substring(commandName.length + 1));
            return false;
        }
    });    
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

    let toughnessFeat = await StrikeItem.createTrait({
        name: "Toughness",
        data: {
            source: "feat",
            text: "<p>+3 to max HP. You Resist 1 damage against anything other than attacks and Opportunities (e.g. against damaging Zones or Ongoing Damage).</p>"
        }
    });

    let stickinessBoost = await StrikeItem.createTrait({
        name: "Stickiness Boost",
        data: {
            source: "role",
            text: "<p>When an enemy grants you an Opportunity, it takes 1 additional damage.</p>"
        }
    });

    let openingFeature = await StrikeItem.createTrait({
        name: "Find an opening",
        data: {
            source: "class",
            text: "<p>When you attack the target of your Duel, you may spend any number of points of its Focus. If you hit, increase your damage by one per point spent.</p>"
        }
    });

    let rallyPower = await StrikeItem.createPower({
        name: "Rally",
        data: {
            action: "none",
            usage: "encounter",
            text: `<p><b>Special:</b> You may only use this on your turn, but you may use at any point in your turn, even while Incapacitated, Dominated, or under any other Status.</p>
<p>Spend an Action Point. Regain 4 Hit Points and regain the use of one Encounter Power from your Class (i.e. not a Role Action) you have expended.</p>`
        }
    });
    
    let meleeBasicPower = await StrikeItem.createPower({
        name: "Melee Basic Attack",
        data: {
            target: "melee",
            range: 1,
            damage: 2,
            text: "<p><b>Effect:</b> None.</p>"
        }
    });


    let gohPower = await StrikeItem.createPower({
        name: "Get Over Here",
        data: {
            source: "class",
            target: "ranged",
            range: 5,
            damage: 2,
            text: "<p><b>Effect:</b> Target is pulled to an adjacent square.</p>"
        }
    });

    let markPower = await StrikeItem.createPower({
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

    let duelPower = await StrikeItem.createPower({
        name: "Duel",
        data: {
            source: "class",            
            action: "free",
            usage: "encounter",
            text: `<p>Target one creature within 10 squares. Until the end of the encounter, when you attack the target, any 2s on your dice are treated as though they were 4s (6s at level 5).</p>
<p><b>Special:</b> This power recharges when its target is Taken Out.</p>`
        }
    });

    let changePower = await StrikeItem.createPower({
        name: "Change Target",
        data: {
            source: "class",            
            action: "attack",
            usage: "at-will",
            text: `<p>Make a Basic Attack against a creature. Then change the target of Duel to that creature.</p>
<p><b>Clarification:</b> If you make this attack multiple times at once (for instance, as a Blaster), you may choose which target to change your Duel to after resolving the attacks. You may only ever have one target of Duel.</p>`
        }
    });

    let cagiPower = await StrikeItem.createPower({
        name: "Come and Get It!",
        data: {
            source: "role",
            action: "role",
            usage: "encounter",
            target: "burst",
            range: 2,
            damage: 2,
            text: `<p>You pull every enemy in the zone to a square adjacent to you. Mark any or all of them until the end of your next turn.</p>`
        }
    });

    let pdPower = await StrikeItem.createPower({
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
        } as StrikeActorData
    });
    let heroData = duplicate(hero.data).token;
    let heroPosition = {x: 9*300, y: 7*300, actorLink: true};

    await hero.createOwnedItem(toughnessFeat);
    await hero.createOwnedItem(rallyPower);
    await hero.createOwnedItem(meleeBasicPower);
    await hero.createOwnedItem(openingFeature);    
    await hero.createOwnedItem(duelPower);
    await hero.createOwnedItem(pdPower);    
    await hero.createOwnedItem(changePower);
    await hero.createOwnedItem(gohPower);
    await hero.createOwnedItem(stickinessBoost);    
    await hero.createOwnedItem(cagiPower);
    await hero.createOwnedItem(markPower);    

    await Token.create(mergeObject(heroData, heroPosition, {inplace: true}));

    let villain = await StrikeActor.create({name: "Villain", type: "monster"});
    let villainData = duplicate(villain.data).token;
    let villainPosition = {x: 11*300, y: 7*300};
    await Token.create(mergeObject(villainData, villainPosition, {inplace: true}));
}