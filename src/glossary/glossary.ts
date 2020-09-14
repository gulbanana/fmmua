import * as chat from "./chat.js";

export function init() {    
    Hooks.on("renderChatMessage", chat.onRenderChatMessage);

    game.settings.register("fmmua", "glossaryChatLinks", {
        name: "fmmua.settings.glossaryChatLinks",
        hint: "fmmua.settings.glossaryChatLinksHint",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
        onChange: chat.refreshLog
    });
}