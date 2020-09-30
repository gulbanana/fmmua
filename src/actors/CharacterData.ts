import StrikeActorData from "./StrikeActorData.js";

export default interface CharacterData extends StrikeActorData {
    class: string;
    role: string;
    ap: {
        value: number;
        max: number;
    };
    mt: {
        value: number;
        max: number;
    };
    strikes: {
        value: number;
        max: number;
    };

    background: string;
    origin: string;
    wealth: number;
    fallback: string;
    skills: string[];
    complications: string[];
    tricks: string[];    
    advances: string[];
    flawsAndFavors: string[];
}
