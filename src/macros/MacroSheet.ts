import StrikeActor from "../actors/StrikeActor.js";

export default class MacroSheet extends MacroConfig {
    render(force?: boolean, options?: any): any {
        let flags = (this.document as any).data.flags as any;
        if (flags.fmmua && flags.fmmua.power) {
            // try and open the power sheet instead
            let actor = ChatMessage.getSpeakerActor(ChatMessage.getSpeaker()) as unknown as StrikeActor | null;
            if (actor) {
                let power = actor.getPower(this.document.name!);
                if (power) {
                    return power.sheet!.render(force, options);
                }
            }
        }

        return super.render(force, options);
    }
}
