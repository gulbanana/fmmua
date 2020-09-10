import entries from "./entries.js";
import insertLinks from "./insertLinks.js";

export default class GlossaryWindow extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = game.i18n.localize("fmmua.glossary.windowTitle");
        options.id = "glossary-window";
        options.template = "systems/fmmua/glossary/GlossaryWindow.html";        
        options.width = 614;
        options.resizable = true;
        options.scrollY = ["#categories", "#contents"]
        return options;
    }

    selectedEntryName: string;

    constructor(selectEntry: string) {
        super();
        this.selectedEntryName = selectEntry;
    }

    getData(options?: any) {
        let data = super.getData(options);

        let entry = entries.Statuses.concat(entries.Rules).filter(e => e.displayName === this.selectedEntryName)[0];
        
        data.displayName = entry.displayName;        

        let contents = typeof entry.content == "string" ? [entry.content] : entry.content;
        data.content = contents.map(p => `<p class="content">${p}</p>`).join("");

        data.categories = [];
        for (let key in entries) {
            let category = 
            {
                key,
                entries: [] as any[]
            };
            for (let e of entries[key]) {
                category.entries.push({
                    displayName: e.displayName,
                    selected: e == entry
                });
            }
            data.categories.push(category);
        }

        return data;
    }

    activateListeners(html: JQuery) {
        let contents = html.find("p.content");
        for (let p of contents) {
            insertLinks(p, false, [this.selectedEntryName]);
        }
        
        let categories = html.find(".category");
        for (let c of categories) {
            c.addEventListener("click", _ev => {
                this.selectedEntryName = c.dataset["entry"] || this.selectedEntryName;
                this.render();
            })
        }
    }
}