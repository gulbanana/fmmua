export default class StrikeCombat extends Combat {
    async duplicateCombatant(id: string) {
        let existing = this.combatants.get(id)?.toObject();
        if (existing) {
            this.createEmbeddedDocuments("Combatant", [existing]);
        }
    }
}