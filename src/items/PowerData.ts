import StrikeData from "./StrikeData.js";

export default interface PowerData extends StrikeData {
    action: "attack" | "triggered" | "free" | "role" | "move";
    usage: "at-will" | "encounter" | "custom";
    usageCustom: string;
    target: "ranged" | "melee" | "burst" | null;
    range: number | null;
    damage: number | null;
    text: string;
}