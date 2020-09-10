import categories, { Entry } from "./categories.js";
import GlossaryWindow from "./GlossaryWindow.js";

export default function insertLinks(node: HTMLElement, tooltip: boolean, skip?: string[]) {
    for (let category of categories) {
        if (!skip?.includes(category.displayName)) {
            for (let entry of category.entries) {
                if (!skip?.includes(entry.displayName)) {
                    insertEntryLinks(entry, node, tooltip);
                }
            }
        }
    }
}

function insertEntryLinks(entry: Entry, node: HTMLElement, tooltip: boolean) {
    for (let child of node.childNodes) {
        if (child instanceof HTMLElement && !child.classList.contains("no-glossary")) {
            insertEntryLinks(entry, child, tooltip);
        } else if (child instanceof Text) {
            replaceContent(entry, node, child, tooltip);
        }
    }
}

function replaceContent(entry: Entry, parent: Element, child: Text, tooltip: boolean) {
    let content = child.nodeValue!;
    let matches = Array.from(content.matchAll(entry.pattern));

    if (matches.length) {
        let replacement = document.createElement("span");

        let position = 0;
        for (let match of matches) {
            let prefix = content.substring(position, (match.index||0) + 1);
            replacement.appendChild(document.createTextNode(prefix));

            let value = match[0];
            value = value.substring(1, value.length - 1);
            
            let link = document.createElement("a");
            link.classList.add("fmmua-glossary");
            link.appendChild(document.createTextNode(value));
            if (tooltip) {
                if (typeof entry.content == "string") {
                    link.dataset["tooltip"] = entry.content;
                }
                else {
                    link.dataset["tooltip"] = entry.content[0] + " (click for more)";
                }
            }
            link.addEventListener("click", _ev => {
                new GlossaryWindow(entry.displayName).render(true);
            });

            replacement.appendChild(link);

            position = match.index! + value.length + 1;
        }
        let suffix = content.substring(position);
        replacement.appendChild(document.createTextNode(suffix));
        
        parent.replaceChild(replacement, child);
    }
}