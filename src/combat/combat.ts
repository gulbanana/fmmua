import StrikeCombat from "./StrikeCombat.js";
import StrikeTracker from "./StrikeTracker.js";

export function init() {
    CONFIG.Combat.entityClass = StrikeCombat;
    CONFIG.ui.combat = StrikeTracker;
}