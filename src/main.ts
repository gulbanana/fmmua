import {init as initDice} from "./dice/dice.js";
import DebugDialog from "./apps/DebugDialog.js";

Hooks.once("init", function() {
    console.log("FMMUA: init");
    initDice();
}); 

Hooks.once("setup", function() {
    console.log("FMMUA: setup");
});

Hooks.once("ready", async function() {
    console.log("FMMUA: ready");
    let result = await DebugDialog.run();
});