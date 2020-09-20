import { init as initActors } from "./actors/actors.js";
import { init as initCombat } from "./combat/combat.js";
import { init as initCommands } from "./commands.js";
import { init as initDice } from "./dice/dice.js";
import { init as initGlossary } from "./glossary/glossary.js";
import { init as initItems } from "./items/items.js";

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

    // subscribe to socket messages
    game.socket.on("system.fmmua", onMessage);

    // patch bugs
    FormApplication.prototype.close = patchedClose;
    CONFIG.JournalEntry.sheetClass = PatchedJournalSheet;

    console.log("FMMUA: end init");
});

function onMessage(message: StrikeMessage) {
    for (let handler of handlers) {
        handler(message);
    }
}

// foundry 0.7.2 does not await submit() or super.close(), leading to a race condition
async function patchedClose(this: FormApplication & { submit(): Promise<FormApplication> }, options: any={}) {
    if ( !this.rendered ) return;

    // Optionally trigger a save
    const submit = options.hasOwnProperty("submit") ? options.submit : this.options.submitOnClose;
    if ( submit ) await this.submit(); // patch 1

    // Close any open FilePicker instances
    this.filepickers.forEach(fp => {
        if ( fp.app ) fp.app.close();
    });
    this.filepickers = [];

    // Close any open MCE editors
    Object.values(this.editors).forEach((ed: any) => {
        if ( ed.mce ) ed.mce.destroy();
    });
    this.editors = {};

    // Close the application itself
    await Application.prototype.close.bind(this)(); // patch 2
}

// foundry 0.7.2 has <= instead of < LIMITED permission (possibly intentional?)
class PatchedJournalSheet extends JournalSheet {
    get title() {
        if ( this.object.permission < CONST.ENTITY_PERMISSIONS.LIMITED ) return "";
        return this.object.name;
    }
}