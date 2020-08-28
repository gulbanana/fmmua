import { init as initCommands } from "./commands.js";
import { init as initDice } from "./dice/dice.js";
import { init as initActors } from "./actors/actors.js";

Hooks.once("init", function() {
    console.log("FMMUA: init");

    initCommands();
    initDice();
    initActors();  
}); 

Hooks.once("setup", function() {
    console.log("FMMUA: setup");
});

Hooks.once("ready", async function() {
    console.log("FMMUA: ready");
});