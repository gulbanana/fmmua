export default interface StrikeActorData {
    notes: string;
    level: number;
    speed: number;
    hp: {
        value: number;
        max: number;
    };
    size: {
        width: number;
        height: number;
    }
}