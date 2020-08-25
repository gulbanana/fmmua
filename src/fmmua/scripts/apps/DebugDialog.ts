export default class DebugDialog extends Dialog {
  constructor(dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["dialog"];
  }
  
  static async run(): Promise<boolean> {  
    const data = {
      title: game.i18n.localize("fmmua.apps.DebugDialog")
    };

    const html = await renderTemplate("systems/fmmua/templates/apps/DebugDialog.html", data);

    const icon = "fa-magic";

    return new Promise((resolve) => {
      const dialog = new this({
        title: `${data.title} Window`,
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

    html.find("#debug-create-actor").click(this.onCreateActor.bind(this));
  }
      
  getParam(): string {
    let input = document.querySelector<HTMLInputElement>("input#param");
    if (input != null && input.value != "") {
        return input.value;
    } else {
        return "null";
    }
  }

  onCreateActor() {
    ui.notifications.info(`Creating actor ${this.getParam()}`);
  }
}