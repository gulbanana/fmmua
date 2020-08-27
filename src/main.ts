import { init as initCommands } from "./commands.js";
import { init as initDice } from "./dice/dice.js";

Hooks.once("init", function() {
    console.log("FMMUA: init");
    initCommands();
    initDice();
}); 

Hooks.once("setup", function() {
    console.log("FMMUA: setup");
});

Hooks.once("ready", async function() {
    console.log("FMMUA: ready");
});