import StrikeItemData from "./StrikeItemData.js";

export default interface TraitData extends StrikeItemData {
    /* derived */
    kind: "class-feature" | "role-boost" | "other";
    kindText: string;
}