import DebugDialog from "./scripts/apps/DebugDialog.js";

Hooks.once("init", function() {
    console.log("FMMUA: init");
});

Hooks.once("setup", function() {
    console.log("FMMUA: setup");
});

Hooks.once("ready", async function() {
    console.log("FMMUA: ready");
    var result = await DebugDialog.run();
    console.log(`FMMUA: Dialog result: ${result}`);
});