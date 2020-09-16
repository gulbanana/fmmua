import { init as initActors } from "./actors/actors.js";
import { init as initCombat } from "./combat/combat.js";
import { init as initCommands } from "./commands.js";
import { init as initDice } from "./dice/dice.js";
import { init as initGlossary } from "./glossary/glossary.js";
import { init as initItems } from "./items/items.js";

Hooks.once("init", function() {
    console.log("FMMUA: begin init");
    
    initActors();    
    initCombat();
    initCommands();
    initDice();
    initGlossary();
    initItems();

    console.log("FMMUA: end init");
});