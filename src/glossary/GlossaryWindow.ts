import categories from "./categories.js";
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

        let entry = categories.flatMap(c => c.entries).filter(e => e.displayName === this.selectedEntryName)[0];
        
        data.displayName = entry.displayName;        

        let contents = typeof entry.content == "string" ? [entry.content] : entry.content;
        data.content = contents.map(p => `<p class="content">${p}</p>`).join("");

        data.categories = [];
        for (let c of categories) {
            let category = 
            {
                key: c.displayName,
                entries: [] as any[]
            };
            for (let e of c.entries) {
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
        let contentQuery = html.find("p.content");
        for (let p of contentQuery) {
            insertLinks(p, false, [this.selectedEntryName]);
        }
        
        let categoryQuery = html.find(".category");
        for (let c of categoryQuery) {
            c.addEventListener("click", _ev => {
                this.selectedEntryName = c.dataset["entry"] || this.selectedEntryName;
                this.render();
            })
        }
    }
}