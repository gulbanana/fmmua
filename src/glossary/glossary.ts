import entries from "./entries.js";
import * as chat from "./chat.js";
import GlossaryWindow from "./GlossaryWindow.js";

interface Entry {
    displayName: string,
    pattern: RegExp,
    content: string
}

export function init() {    
    Hooks.on("renderChatMessage", chat.onRenderChatMessage);

    game.settings.register("fmmua", "glossaryChatLinks", {
        name: "fmmua.settings.glossaryChatLinks",
        hint: "fmmua.settings.glossaryChatLinksHint",
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
        onChange: chat.refreshLog
    });
}

function walkDom(entry: Entry, node: HTMLElement) {
    for (let child of node.childNodes) {
        if (child instanceof HTMLElement) {
            walkDom(entry, child);
        } else if (child instanceof Text) {
            insertLinks(entry, node, child);
        }
    }
}

function insertLinks(entry: Entry, parent: Element, child: Text) {
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
            link.dataset["tooltip"] = entry.content;
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