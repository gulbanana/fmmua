import * as dice from './dice.js';
import { RollTag } from './StrikeRoll.js';

export interface RollDialogResult {
    execute: boolean;
    advantage: boolean;
    disadvantage: boolean;
}

export default class RollDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["fmmua", "dialog"];
    }

    static async run(flavor?: string): Promise<void> {
        const content = await renderTemplate("systems/fmmua/dice/RollDialog.html", { flavor });

        return new Promise((resolve) => {
            const dialog = new this({
                title: "Strike Roll",
                content,
                buttons: {
                    roll: {
                        icon: `<i class="fas fa-dice"></i>`,
                        label: "Roll",
                        callback: (html: JQuery<HTMLElement>) => {
                            dice.strikeRoll(
                                html[0].querySelector<HTMLInputElement>(".fmmua-advantage")!.checked,
                                html[0].querySelector<HTMLInputElement>(".fmmua-disadvantage")!.checked,
                                html[0].querySelector<HTMLInputElement>(".fmmua-flavor")!.value,
                                html[0].querySelector<HTMLSelectElement>(".fmmua-roll-type")!.value as RollTag
                            );                            
                            resolve();
                        }
                    },
                },
                default: "roll",
                close: () => resolve()
            });
            dialog.render(true);
        });
    }
}