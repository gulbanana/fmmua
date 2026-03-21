import StrikeActor from "../actors/StrikeActor.js";

export default class MacroSheet extends MacroConfig {
    render(force?: boolean, options?: Application.RenderOptions): any {
        let flags = this.entity.data.flags as any;
        if (flags.fmmua && flags.fmmua.power) {
            // try and open the power sheet instead
            let actor = ChatMessage.getSpeakerActor(ChatMessage.getSpeaker()) as unknown as StrikeActor | null;
            if (actor) {
                let power = actor.getPower(this.entity.name!);
                if (power) {
                    return power.sheet!.render(force, options);
                }
            }
        }

        return super.render(force, options);
    }
}
