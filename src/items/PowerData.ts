import StrikeData from "./StrikeData.js";

export default interface PowerData extends StrikeData {
    action: "attack" | "triggered" | "free" | "role" | "move";
    usage: "at-will" | "encounter";
    target: "ranged" | "melee" | "burst"
    range: number;
    damage: number | null;
}