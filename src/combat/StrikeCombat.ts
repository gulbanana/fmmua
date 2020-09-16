export default class StrikeCombat extends Combat {
    async duplicateCombatant(id: string) {
        let existing = this.getEmbeddedEntity("Combatant", id);
        this.createEmbeddedEntity("Combatant", existing);
    }
}