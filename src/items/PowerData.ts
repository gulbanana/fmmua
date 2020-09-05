import StrikeData from "./StrikeData.js";

export default interface PowerData extends StrikeData {
    action: "free" | "attack" | "role" | "move" | "reaction" | "interrupt" | "none";
    usage: "at-will" | "encounter" | "custom";    
    target: "ranged" | "melee" | "burst" | null;
    range: number;
    damage: number | null;
    text: string;
    customType: string | null;
    customSubtype: string | null;

    /* derived */
    kind: "class-at-will" | "class-encounter" | "role-at-will" | "role-encounter" | "other";
    actionIcon: string | null;
    rangeIcon: string;
    usageText: string;
    subtypeText: string |  null;
    hasTarget: boolean;
    hasRange: boolean;
    hasDamage: boolean;        
}