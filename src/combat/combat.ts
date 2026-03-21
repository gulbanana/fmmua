import StrikeCombat from "./StrikeCombat.js";
import StrikeTracker from "./StrikeTracker.js";

export function _init() {
    CONFIG.Combat.initiative.decimals = 0; // only needed 0.7.5 -> 0.7.7, but harmless 0.7.8+
    CONFIG.Combat.documentClass = StrikeCombat as any;
    CONFIG.ui.combat = StrikeTracker as any;

    Hooks.on("updateActor", onUpdateActor);
}

// hardcoded list replaces the configurable one in base foundry
let trackedResources = ["ap.value", "hp.value", "mt.value", "strikes.value"];

async function onUpdateActor(actor: Actor, data: any, _options: {}, _userId: string) {
    actor.getActiveTokens().forEach(token => {
        if (token.inCombat && data.data && trackedResources.some(r => hasProperty(data.data, r))) {
            game.combat!.setupTurns();
            ui.combat.render();
        }
    });
}
