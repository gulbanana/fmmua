import entries from "./entries.js";
import insertLinks from "./insertLinks.js";

export default class GlossaryWindow extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("fmmua.glossary.windowTitle");
        options.id = "glossary-window";
        options.template = "systems/fmmua/glossary/GlossaryWindow.html";
        options.scrollY = undefined
        options.width = 600;
        return options;
    }

    selectedEntry: string;

    constructor(selectEntry: string) {
        super();
        this.selectedEntry = selectEntry;
    }

    getData(options?: any) {
        let data = super.getData(options);

        data.displayName = this.selectedEntry;
        data.content = entries.filter(e => e.displayName === this.selectedEntry)[0].content;

        return data;
    }

    activateListeners(html: JQuery) {
        let content = html.find("p.content");
        if (content.length > 0) {
            insertLinks(content[0], this.selectedEntry);
        }        
    }
}