export default interface StrikeActorData {
    notes: string;
    level: number;
    speed: number;
    hp: {
        value: number;
        max: number;
    };
    // character
    class?: string;
    role?: string;
    ap?: {
        value: number;
        max: number;
    };
    strikes: number;    
    // monster
    rank?: "Stooge" | "Goon" | "Standard" | "Elite" | "Champion",
    size?: {
        width: number;
        height: number;
    }
}
