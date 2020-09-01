export default interface StrikeData {
    notes: string;
    level: number;
    speed: number;
    hp: {
        value: number;
        max: number;
    };
    ap: {
        value: number;
        max: number;
    };
    // character
    class?: string;
    role?: string;
    // monster
    rank?: "Stooge" | "Goon" | "Standard" | "Elite" | "Champion",
    size?: {
        width: number;
        height: number;
    }
}
