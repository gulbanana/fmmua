import { init as initDice } from "./dice/dice.js";
import { init as initActors } from "./actors/actors.js";
import { init as initItems } from "./items/items.js";
import { init as initCommands } from "./commands.js";

Hooks.once("init", function() {
    console.log("FMMUA: init");

    initDice();
    initActors();
    initItems();
    initCommands();
}); 

Hooks.once("setup", function() {
    console.log("FMMUA: setup");
});

Hooks.once("ready", async function() {
    console.log("FMMUA: ready");
});