export default interface StrikeData {
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
