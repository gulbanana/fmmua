import StrikeActor from "../actors/StrikeActor.js";

export default class MacroSheet extends MacroConfig {
    render(force?: boolean, options?: RenderOptions): any {
        if (this.entity.data.flags.fmmua && this.entity.data.flags.fmmua.power) {
            // try and open the power sheet instead
            let actor = ChatMessage.getSpeakerActor(ChatMessage.getSpeaker()) as StrikeActor | null;
            if (actor) {
                let power = actor.getPower(this.entity.name);
                if (power) {
                    return power.sheet.render(force, options);
                }
            }
        }

        return super.render(force, options);
    }
}
