import * as dice from '../dice/dice.js';

export default class DebugDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["dialog"];
    }

    static async run(): Promise<boolean> {
        const data = {
            title: game.i18n.localize("fmmua.apps.DebugDialog")
        };

        const html = await renderTemplate("systems/fmmua/apps/DebugDialog.html", data);

        const icon = "fa-magic";

        return new Promise((resolve) => {
            const dialog = new this({
                title: data.title,
                content: html,
                buttons: {
                },
                default: null,
                close: () => resolve(false)
            });
            dialog.render(true);
        });
    }

    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find("#debug-roll").click(this.onRoll.bind(this));
        html.find("#debug-roll-skill").click(this.onRollSkill.bind(this));
        html.find("#debug-roll-attack").click(this.onRollAttack.bind(this));
        html.find("#debug-roll-save").click(this.onRollSave.bind(this));
    }

    getString(name: string): string {
        let input = document.querySelector<HTMLInputElement>("input#" + name);
        if (input != null && input.value != "") {
            return input.value;
        } else {
            return "null";
        }
    }

    getBoolean(name: string): boolean {
        let input = document.querySelector<HTMLInputElement>("input#" + name);
        if (input != null) {
            return input.checked;
        } else {
            return false;
        }
    }

    async onRoll() {
        let advantage = this.getBoolean("debug-advantage");
        let disadvantage = this.getBoolean("debug-disadvantage");

        let r = await dice.strikeRoll(advantage, disadvantage);
        
        ui.notifications.info(r.toString());    
    }

    async onRollSkill() {
        let advantage = this.getBoolean("debug-advantage");
        let disadvantage = this.getBoolean("debug-disadvantage");

        let r = await dice.skillRoll(advantage, disadvantage);

        ui.notifications.info(r.toString());    
    }

    async onRollAttack() {
        let advantage = this.getBoolean("debug-advantage");
        let disadvantage = this.getBoolean("debug-disadvantage");

        let r = await dice.attackRoll(advantage, disadvantage);

        ui.notifications.info(r.toString());
    }

    async onRollSave() {
        let advantage = this.getBoolean("debug-advantage");
        let disadvantage = this.getBoolean("debug-disadvantage");

        let r = await dice.savingThrow(advantage, disadvantage);

        ui.notifications.info(r.toString());
    }
}