import entries from "./entries.js";
import GlossaryWindow from "./GlossaryWindow.js";

interface Entry {
    displayName: string,
    pattern: RegExp,
    content: string | string[]
}

export default function insertLinks(node: HTMLElement, tooltip: boolean, skip?: string[]) {
    for (let category of Object.getOwnPropertyNames(entries)) {
        if (!skip?.includes(category)) {
            for (let entry of entries[category]) {
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
            let prefix = content.substring(position, match.index);
            replacement.appendChild(document.createTextNode(prefix));

            let value = match[0];
            
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

            position = match.index! + value.length;
        }
        let suffix = content.substring(position);
        replacement.appendChild(document.createTextNode(suffix));
        
        parent.replaceChild(replacement, child);
    }
}