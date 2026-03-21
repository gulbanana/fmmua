// Compatibility types bridging the gap between 0.7.x and 9.x foundry-vtt-types.
// The old types had Actor.Data<T> and Item.Data<T> namespaces that the codebase
// uses extensively. The 9.x types don't have these, so we define local equivalents.

/**
 * Represents the full data object for an Item document, as returned by getData()
 * or accessed via actor.data.items in V9.
 * Replaces the old Item.Data<T> generic.
 */
interface StrikeItemDataObject<T = any> {
    _id: string;
    name: string;
    type: string;
    img: string;
    data: T;
    effects: any[];
    sort: number;
    flags: Record<string, any>;
    permission: Record<string, number>;
}

// Tell foundry-vtt-types that game, canvas, socket, and ui are always initialized.
// This is safe because all our code runs from the "init" hook onward.
interface LenientGlobalVariableTypes {
    game: never;
    canvas: never;
    socket: never;
    ui: never;
}
