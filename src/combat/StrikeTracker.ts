import StrikeCombat from "./StrikeCombat";

// tracks multiple resources - vestigial support for this existed prior to 0.7.3 but it's now in-house
export default class StrikeTracker extends CombatTracker<StrikeCombat> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/fmmua/combat/StrikeTracker.html"
        });
    }

    /**
     * Cache the values of additional tracked resources for each Token in Combat
     * @type {Object}
     */
    trackedResources: Record<string, Record<string, number>>;

    constructor(options: any) {
        super(options);
        this.trackedResources = {};
    }

    async getData(options: any) {
        let result = await super.getData(options);

        for (let t of result.turns) {
            t.resources = [];   
            t.strikes = [];

            let strikes = this.trackedResources[t.tokenId]?.["strikes.value"];
            if (strikes) {
                for (let i = 0; i < strikes; i++) {
                    t.strikes.push({});
                }
            }
        
            let ap = this.trackedResources[t.tokenId]?.["ap.value"];                
            if (ap) {
                t.resources.push({
                    tooltip: game.i18n.localize("fmmua.actor.ap"),
                    value: ap,
                    color: "gold"
                });      
            }

            let mt = this.trackedResources[t.tokenId]?.["mt.value"];
            if (mt) {
                t.resources.push({
                    tooltip: game.i18n.localize("fmmua.actor.mt"),
                    value: mt,
                    color: "mediumorchid"
                });      
            }

            let hp = this.trackedResources[t.tokenId]?.["hp.value"];
            let maxHp = this.trackedResources[t.tokenId]?.["hp.max"];
            t.resources.push({
                tooltip: game.i18n.localize("fmmua.actor.hp"),
                value: hp,
                color: hp > (maxHp/2) ? "lightgreen" : 
                        hp > 0 ? "green" :
                        "red"
            });
        }

        return result;
    }

    render(force?: boolean, options?: RenderOptions) {
        this.updateTrackedResources();
        return super.render(force, options);
    }

    updateTrackedResources() {
        const combat = this.combat;
        if ( !combat ) return this.trackedResources = {};
        
        const keys = ["hp.value", "hp.max", "ap.value", "mt.value", "strikes.value"];

        this.trackedResources = combat.turns.reduce((obj: Record<string, any>, t) => {
            if ( !t.token ) return obj;
            const token = new Token(t.token);            
            obj[token.id] = keys.reduce((res: Record<string, number|null>, r) => {
                res[r] = t.actor ? getProperty(token.actor.data.data, r) : null;
                return res;
            }, {});
            return obj;
        }, {});
    
        // Synchronize updates with the pop-out tracker
        if ( this._popout ) this._popout.trackedResources = this.trackedResources;
        return this.trackedResources;
    }

    _getEntryContextOptions() {
        var contextMenu = super._getEntryContextOptions();
        contextMenu.push({
            name: game.i18n.localize("fmmua.combat.CombatantDuplicate"),
            icon: '<i class="fas fa-dice-d6"></i>',
            callback: li => this.combat?.duplicateCombatant(li.data('combatant-id'))
        })
        return contextMenu;
    }
}