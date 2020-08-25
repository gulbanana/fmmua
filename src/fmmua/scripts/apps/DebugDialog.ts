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
          no: {
            icon: `<i class="fas ${icon}"></i>`,
            label: "No",
            callback: () => resolve(false)
          },
          yes: {
            icon: `<i class="fas ${icon}"></i>`,
            label: "Yes",
            callback: () => resolve(true)
          }
        },
        default: "yes",
        close: () => resolve(false)
      });
      dialog.render(true);
    });
  }
}