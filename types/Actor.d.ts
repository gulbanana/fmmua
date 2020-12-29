declare interface ActorData<DataType = any> extends EntityData<DataType> {
	img: string;
    token: TokenData; // any in foundry-pc-types
    permission: Record<string, number>; // missing in foundry-pc-types
    effects: ActiveEffect[];
}