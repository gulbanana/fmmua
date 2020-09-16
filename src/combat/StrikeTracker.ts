import StrikeCombat from "./StrikeCombat";

export default class StrikeTracker extends CombatTracker<StrikeCombat> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/fmmua/combat/StrikeTracker.html"
        });
    }

    async getData(options: any) {
        let result = await super.getData(options);

        for (let t of result.turns) {
            t.resources = [];      
                let ap = this.trackedResources[t.tokenId]?.["ap.value"];                
                if (ap) {
                    t.resources.push({
                        tooltip: "Action Points",
                        value: ap,
                        color: "gold"
                    });      
                }

                let hp = this.trackedResources[t.tokenId]?.["hp.value"];
                let maxHp = this.trackedResources[t.tokenId]?.["hp.max"];
                t.resources.push({
                    tooltip: "HP",
                    value: hp,
                    color: hp > (maxHp/2) ? "lightgreen" : 
                           hp > 0 ? "green" :
                           "red"
                });

                // #aa0200 dark red
                // #18520b dark green
        }

        return result;
    }

    // modified version of the base class implementation which ignores token permissions and supports multiple resources
    updateTrackedResources() {
        const combat = this.combat;
        if ( !combat ) return this.trackedResources = {};
        
        const keys = ["hp.value", "hp.max", "ap.value"];

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
}