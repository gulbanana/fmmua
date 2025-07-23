import "./main.scss";

import { _init as initActors } from "./actors/actors.js";
import { _init as initCombat } from "./combat/combat.js";
import { _init as initCommands } from "./commands.js";
import { _init as initDice } from "./dice/dice.js";
import { _init as initGlossary } from "./glossary/glossary.js";
import { _init as initItems } from "./items/items.js";
import { _init as initMacros } from "./macros/macros.js";

let handlers: MessageHandler[] = [];

Hooks.once("init", function() {
    console.log("FMMUA: begin init");  

    // init subsystems
    initActors(handlers);    
    initCombat();
    initCommands();
    initDice();
    initGlossary();
    initItems();
    initMacros();

    // subscribe to socket messages
    game.socket.on("system.fmmua", onMessage);

    console.log("FMMUA: end init");
});

function onMessage(message: StrikeMessage) {
    for (let handler of handlers) {
        handler(message);
    }
}
