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
    class?: string;
    role?: string;    
}
