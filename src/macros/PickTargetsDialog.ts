import Cancellation from "./Cancellation.js";
import Target from "./Target.js";

export default class PickTargetsDialog extends Dialog {
    static async run(n: number, candidates: Token[]): Promise<Target[]> {
        let pickers = [];
        let max = n == -1 ? candidates.length: n;
        for (let i = 0; i < max; i++) {
            let initialImg = candidates[i].data.img;
            let tokens = candidates.map((t, ix) => { return {
                token: t,
                selected: ix == i,
                disabled: ix < max 
            };});
            pickers.push({ initialImg, tokens });
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
        return html
            .find<HTMLDivElement>(".pick-target")
            .filter(function(_index, _element): boolean {
                let select = this.querySelector("select")!;
                return typeof select.value === "string" && select.value != "";
            })
            .map<Target>(function() {
                let select = this.querySelector("select")!;
                let a = this.querySelector<HTMLInputElement>("input[name=advantage]")!;
                let d = this.querySelector<HTMLInputElement>("input[name=disadvantage]")!;
                return new Target(canvas.tokens.get(select.value), a.checked, d.checked);
            }).get();
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        for (let picker of html.find(".pick-target")) {
            let select = picker.querySelector("select")!;
            let img = picker.querySelector("img")!;
            let checkboxes = picker.querySelectorAll<HTMLInputElement>("input[type=checkbox]");

            select.addEventListener("change", ev => {
                let token: Token|null = canvas.tokens.get(select.value);
                
                img.src = token?.data?.img || "";
                img.style.display = token == null ? "none" : "inherit";
                for (let checkbox of checkboxes) {
                    checkbox.disabled = token == null;
                    checkbox.checked = checkbox.checked && token != null;
                }

                this._enableTargets(html);
            });

            for (let option of picker.querySelectorAll<HTMLInputElement>("input[type=checkbox]")) {
                option.addEventListener("change", () => {
                    if (option.checked) {
                        for (let other of picker.querySelectorAll<HTMLInputElement>("input[type=checkbox]")) {
                            if (other != option) {
                                other.checked = false;
                            }
                        }
                    }
                })
            }
        }
    }

    _enableTargets(html: JQuery) {
        let allOptions = html.find<HTMLOptionElement>(`option[value]`).get();
        for (let picker of html.find(".pick-target")) {
            let select = picker.querySelector("select")!;
            for (let option of select.querySelectorAll<HTMLOptionElement>("option[value]")) {
                if (option.value != "") {
                    option.disabled = !option.selected && allOptions.filter(o => o.selected && o.value == option.value).length > 0;
                }
            }
        }
    }
}