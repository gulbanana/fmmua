var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class DebugDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["dialog"];
    }
    static run() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                title: game.i18n.localize("fmmua.apps.DebugDialog")
            };
            const html = yield renderTemplate("systems/fmmua/templates/apps/DebugDialog.html", data);
            const icon = "fa-magic";
            return new Promise((resolve) => {
                const dialog = new this({
                    title: `${data.title} Window`,
                    content: html,
                    buttons: {},
                    default: null,
                    close: () => resolve(false)
                });
                dialog.render(true);
            });
        });
    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find("#debug-create-actor").click(this.onCreateActor.bind(this));
    }
    getParam() {
        let input = document.querySelector("input#param");
        if (input != null && input.value != "") {
            return input.value;
        }
        else {
            return "null";
        }
    }
    onCreateActor() {
        ui.notifications.info(`Creating actor ${this.getParam()}`);
    }
}
