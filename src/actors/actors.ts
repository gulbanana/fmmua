import StrikeActor from "./StrikeActor.js";
import StrikeActorData from "./StrikeActorData.js";
import CharacterSheet from "./CharacterSheet.js";
import MonsterSheet from "./MonsterSheet.js";

export function _init(handlers: MessageHandler[]) {
    CONFIG.Actor.entityClass = StrikeActor as typeof Actor;  

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fmmua", CharacterSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("fmmua", MonsterSheet, { types: ["monster"], makeDefault: true });

    loadTemplates(["systems/fmmua/actors/AdventureSheet.html", "systems/fmmua/actors/TacticalSheet.html"]);

    game.settings.register("fmmua", "actorsGroupPowers", {
        name: "fmmua.settings.actorsGroupPowers",
        hint: "fmmua.settings.actorsGroupPowersHint",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
        onChange: () => {
            for (let key in ui.windows) {
                let app = ui.windows[key];
                if (app instanceof CharacterSheet) {
                    app.render();
                }
            }
        }
    });

    // sync token size with the actor's data.size
    Hooks.on("updateActor", onUpdateActor);
    Hooks.on("updateToken", onUpdateToken);

    // socket message allowing players to delete their own tokens
    document.addEventListener("keydown", onKeyDown);
    handlers.push(message => {
        if (message.event == "deleteTokens") {
            handleDeleteTokens(message);
        }
    });
}

async function onUpdateActor(entity: StrikeActor, data: ActorData<StrikeActorData>, _options: {render: boolean}, _userId: string) {
    if (typeof data?.data?.size === "object") {
        await entity.update({ token: data.data.size })
        for (let token of entity.getActiveTokens(true)) {
            await token.update(data.data.size);
        }
    }
}

async function onUpdateToken(_parent: Scene, _doc: TokenData, update: {_id: string, actorData: Partial<ActorData<StrikeActorData>>}, _options: {diff: boolean}, _userId: string) {
    if (typeof update.actorData?.data?.size === "object") {
        let token = canvas.tokens.get(update._id);
        await token.update(update.actorData.data.size);
    }
}

function onKeyDown(ev: KeyboardEvent) {
    // preconditions: key pressed as non-gm player with the foundry frame focused on the token layer
    if (!["Backspace", "Delete"].includes(ev.key)) return;    
    if (!(ev.target instanceof HTMLElement) || ev.target.tagName != 'BODY') return;
    if (ui.controls.activeControl != 'token') return;
    if (game.user.role != CONST.USER_ROLES.TRUSTED) return;

    // request deletion for selected owned tokens
    let tokens = canvas.tokens.controlled.filter(t => t.owner).map(t => t.id);
    if (tokens.length) {
        // , if possible
        let gm = game.users.find((u: User) => u.active && u.isGM);
        if (!gm) {
            ui.notifications.error(game.i18n.localize("fmmua.error.deleteTokens.NoGM"));
            return;
        }

        let message: StrikeMessage = {
            event: "deleteTokens",
            user: game.user.id,
            scene: canvas.scene.id,
            tokens
        };
        game.socket.emit("system.fmmua", message);
        ev.preventDefault();
    }
}

function handleDeleteTokens(message: DeleteTokensMessage) {    
    let user = game.users.get(message.user);    
    if (user.role < CONST.USER_ROLES.TRUSTED) {
        ui.notifications.warn(game.i18n.format("fmmua.error.deleteTokens.UntrustedUser", { user: user.name }));
        return;
    }

    let scene = game.scenes.get(message.scene);
    let tokens = message.tokens.map(id => new Token(scene.getEmbeddedEntity("Token", id)));

    if (tokens.some(t => !t.actor.hasPerm(user, CONST.ENTITY_PERMISSIONS.OWNER))) {
        ui.notifications.warn(game.i18n.format("fmmua.error.deleteTokens.UnownedTokens", { user: user.name }));
        return;
    }

    scene.deleteEmbeddedEntity("Token", message.tokens);
}