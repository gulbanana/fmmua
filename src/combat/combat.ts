import StrikeCombat from "./StrikeCombat.js";
import StrikeTracker from "./StrikeTracker.js";

export function _init() {
    CONFIG.Combat.initiative.decimals = 0;
    CONFIG.Combat.entityClass = StrikeCombat;
    CONFIG.ui.combat = StrikeTracker;
}