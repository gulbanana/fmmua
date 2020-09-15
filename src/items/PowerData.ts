import StrikeItemData from "./StrikeItemData.js";

export type Target = {
    mode: "ranged",
    burst?: number,
    range: number
} | {
    mode: "melee",
    burst?: number
};

export default interface PowerData extends StrikeItemData {
    customImage: string | null; // can i get rid of this?
    action: "free" | "attack" | "role" | "move" | "reaction" | "interrupt" | "none";
    usage: "at-will" | "encounter" | "custom";    
    customUsage: string | null;
    targets: Target[];    
    customTarget: string | null;
    damage?: number;

    /* derived */
    kind: "class-at-will" | "class-encounter" | "role-at-will" | "role-encounter" | "other-at-will" | "other-encounter" | "monster-power";
    actionIcon: string | null;
    rangeIcon: string;
    usageText: string;
    subtypeText: string |  null;
    targetHtml: string;
}