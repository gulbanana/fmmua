import StrikeItemData from "./StrikeItemData.js";

type Target = {
    mode: "ranged",
    burst?: number,
    range: number
} | {
    mode: "melee",
    burst?: number
};

export default interface PowerData extends StrikeItemData {
    action: "free" | "attack" | "role" | "move" | "reaction" | "interrupt" | "none";
    usage: "at-will" | "encounter" | "custom";    
    targets: Target[];
    damage: number;
    customType: string | null;
    customSubtype: string | null;
    customImage: string | null;

    /* derived */
    kind: "class-at-will" | "class-encounter" | "role-at-will" | "role-encounter" | "other-at-will" | "other-encounter" | "monster-power";
    actionIcon: string | null;
    rangeIcon: string;
    usageText: string;
    subtypeText: string |  null;
    targetHtml: string;
}