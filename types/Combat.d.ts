type Combatant = {
    token: Token|null,
    actor: Actor|null,
    name: string,
    players: User[],
    owner: boolean,
    visible: boolean
};

declare interface Combat {
    turns: Combatant[];
    deleteCombatant(id: string, options?: any): Promise<string>;
}