import RollDialog from "./dice/RollDialog.js";
import StrikeActor from "./actors/StrikeActor.js";
import CharacterData from "./actors/CharacterData.js";
import GlossaryWindow from "./glossary/GlossaryWindow.js";
import glossaryCategories from "./glossary/categories.js";
import StrikeItem from "./items/StrikeItem.js";
import PowerData from "./items/PowerData.js";

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
                speaker: {
                    scene: data.speaker.scene,
                    actor: data.speaker.actor,
                    token: data.speaker.token,
                    alias: "FMMUA"
                },
                whisper: [game.user!]
            } as any);
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
    "/spower": {
        param: "name",
        f: (data, name) => {
            if (canvas.tokens!.controlled.length < 1) {
                ui.notifications.warn("No controlled tokens.");
                return;
            }
            let actor = canvas.tokens!.controlled[0].actor as unknown as StrikeActor;

            if (name.length > 0) {
                actor.use(name);
            } else {
                let helpText = `<h3>Powers for ${actor.name}</h3><table>`;
                let powers = Array.from(actor.items.filter(i => i.type == "power")).sort((a, b) => a.name!.localeCompare(b.name!));
                for (let p of powers) {
                    let pData = (p.data as any).data as PowerData;
                    helpText += `<tr><td>${p.name}</td><td>${pData.usage}</td><td>${pData.action}</td></tr>\n`;
                }
                helpText += "</table>";
                ChatMessage.create({
                    content: helpText,
                    speaker: {
                        scene: data.speaker.scene,
                        actor: data.speaker.actor,
                        token: data.speaker.token,
                        alias: "FMMUA"
                    },
                    whisper: [game.user!]
                } as any);
            }
        },
        help: "Use one of the controlled token's powers, or list available powers."
    },
    "/reset": {
        f: () => {
            reset();
        },
        help: "debug - use only in test worlds"
    }
}

export function _init() {
    if ((game.world as any).data.name != "test-world") {
        delete commands["/reset"];
    }

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
    let scene = game.scenes!.getName("Scene")!;
    let tokens = scene.tokens;

    for (let token of tokens) {
        await scene.deleteEmbeddedDocuments("Token", [token.id!]);
    }

    for (let actor of game.actors!.values()) {
        await actor.delete();
    }

    for (let item of game.items!.values()) {
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

    let gohPower = await StrikeItem.createPower({
        name: "Get Over Here",
        data: {
            source: "class",
            text: "<p><b>Effect:</b> Target is pulled to an adjacent square.</p>"
        }
    });

    let markPower = await StrikeItem.createPower({
        name: "Mark",
        data: {
            source: "role",
            action: "role",
            damage: 0,
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
            targets: [],
            damage: 0,
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
            targets: [],
            damage: 0,
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
            targets: [ { mode: "melee", burst: 2 } ],
            text: `<p>You pull every enemy in the zone to a square adjacent to you. Mark any or all of them until the end of your next turn.</p>`
        }
    });

    let pdPower = await StrikeItem.createPower({
        name: "Perfect Defense",
        data: {
            source: "class",
            action: "attack",
            usage: "encounter",
            targets: [ { mode: "melee" } ],
            damage: 3,
            text: `<p><b>Effect:</b> Target has Disadvantage to attack you. It makes a Saving Throw against this Status each time it hits you with an attack.</p>`
        }
    });

    let hero = await StrikeActor.create({
        name: "Hero",
        type: "character",
        permission: {
            [game.users!.getName("Player 2")!.id!]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER
        },
        data: {
            class: "Duelist",
            role: "Defender",
            background: "Born on a Mountain",
            origin: "Raised in a Cave",
            skills: ["Trucking"]
        } as CharacterData
    });
    let heroData = (foundry.utils.deepClone(hero!.data) as any).token;
    let heroPosition = {x: 9*300, y: 7*300, actorLink: true};

    await hero!.createEmbeddedDocuments("Item", [toughnessFeat!.data as any]);

    await hero!.createEmbeddedDocuments("Item", [openingFeature!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [duelPower!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [pdPower!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [changePower!.data as any]);

    await hero!.createEmbeddedDocuments("Item", [stickinessBoost!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [gohPower!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [cagiPower!.data as any]);
    await hero!.createEmbeddedDocuments("Item", [markPower!.data as any]);

    scene = game.scenes!.getName("Scene")!;
    await scene.createEmbeddedDocuments("Token", [mergeObject(heroData, heroPosition, {inplace: true})]);

    let villain = await StrikeActor.create({name: "Villain", type: "monster"});
    let villainData = (foundry.utils.deepClone(villain!.data) as any).token;
    let villainPosition = {x: 11*300, y: 7*300};

    let iaPower = await StrikeItem.createPower({
        name: "Inspiring Attack",
        data: {
            action: "attack",
            usage: "at-will",
            targets: [
                { mode: "melee" },
                { mode: "ranged", range: 5 }
            ],
            damage: 2,
            text: `<p><b>Effect:</b> One ally regains 2 HP (or a damaged Goon recovers).</p>`
        }
    });

    let slPower = await StrikeItem.createPower({
        name: "Slowdown",
        data: {
            action: "attack",
            usage: "at-will",
            targets: [
                { mode: "ranged", range: 10, burst: 2 }
            ],
            damage: 1,
            text: `<p><b>Effect:</b> Target is Immobilized until the end of its next turn. (L6+: save ends).</p>`
        }
    });

    await villain!.createEmbeddedDocuments("Item", [iaPower!.data as any]);
    await villain!.createEmbeddedDocuments("Item", [slPower!.data as any]);

    await scene.createEmbeddedDocuments("Token", [mergeObject(villainData, villainPosition, {inplace: true})]);
}
