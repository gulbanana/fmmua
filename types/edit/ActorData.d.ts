declare interface ActorData<DataType = any> extends EntityData<DataType> {
    token: TokenData; // any in foundry-pc-types
    permission: Record<string, number>; // missing in foundry-pc-types
    items: ItemData[]; // missing in foundry-pc-types
    effects: ActiveEffectData[]; // missing in foundry-pc-types
}