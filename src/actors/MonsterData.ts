import StrikeActorData from "./StrikeActorData.js";

export default interface MonsterData extends StrikeActorData {
    rank: "Stooge" | "Goon" | "Standard" | "Elite" | "Champion";
}
