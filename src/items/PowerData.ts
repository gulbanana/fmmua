import StrikeItemData from "./StrikeItemData.js";

export default interface PowerData extends StrikeItemData {
    action: "free" | "attack" | "role" | "move" | "reaction" | "interrupt" | "none";
    usage: "at-will" | "encounter" | "custom";    
    target: "ranged" | "melee" | "burst" | null;
    range: number;
    damage: number | null;
    customType: string | null;
    customSubtype: string | null;
    customImage: string | null;

    /* derived */
    kind: "class-at-will" | "class-encounter" | "role-at-will" | "role-encounter" | "other-at-will" | "other-encounter" | "monster-power";
    actionIcon: string | null;
    rangeIcon: string;
    usageText: string;
    subtypeText: string |  null;
    hasTarget: boolean;
    hasRange: boolean;
    hasDamage: boolean;        
}