import Cancellation from "./Cancellation.js";
import Target from "./Target.js";

export default class PickTargetsDialog extends Dialog {
    static async run(n: number, candidates: Token[]): Promise<Target[]> {
        let pickers = [];
        let max = n == -1 ? candidates.length: n;
        for (let i = 0; i < max; i++) {
            pickers.push({
                initialImg: candidates[0].data.img,
                tokens: candidates
            });
        }

        let content = await renderTemplate("systems/fmmua/macros/PickTargetsDialog.html", {
            pickers
        });

        return await new Promise<Target[]>((resolve, reject) => {
            new this({
                content,
                title: max > 1 ? "Pick Targets" : "Pick Target",
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: _ => reject(new Cancellation())
                    },
                    pick: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Pick",
                        callback: html => resolve(this._submit(html as JQuery))
                    }
                },
                default: "pick"
            }, { classes: ["fmmua", "dialog"] }).render(true);
        });
    }

    static _submit(html: JQuery): Target[] {
        let selects = Array.from(html.find<HTMLSelectElement>(".pick-targets>select"));
        return selects.map(select => new Target(canvas.tokens.get(select.value), false, false));
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        for (let picker of html.find(".pick-targets")) {
            let select = picker.querySelector("select")!;
            let img = picker.querySelector("img")!;
            select.addEventListener("change", ev => {
                img.src = canvas.tokens.get(select.value).data.img;
            });
        }
    }
}