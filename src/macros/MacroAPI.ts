import StrikeActor from "../actors/StrikeActor";
import StrikeItem from "../items/StrikeItem";

export default interface MacroAPI {
    token: Token;
    actor: StrikeActor;    
    power: StrikeItem;
}