import { BLEND_MODES } from "pixi.js";

export function init() {    
    Hooks.on("renderChatMessage", onRenderChatMessage);

    game.settings.register("fmmua", "glossaryChatLinks", {
        name: "fmmua.settings.glossaryChatLinks",
        hint: "fmmua.settings.glossaryChatLinksHint",
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
    });
}

function onRenderChatMessage(_app: Application, html: JQuery<HTMLElement>, _data: any) {
    if (game.settings.get("fmmua", "glossaryChatLinks")) {    
        let content = html.find(".message-content");
        if (content.length > 0 && content[0] instanceof HTMLElement) {
            walk(content[0]);
        }
    }
}

let dominated = new RegExp("incapacitated?|dominated?", "ig");

function walk(node: HTMLElement) {
    for (let child of node.childNodes) {
        if (child instanceof HTMLElement) {
            walk (child as HTMLElement);
        } else if (child instanceof Text) {
            let content = child.nodeValue!;
            let matches = Array.from(content.matchAll(dominated));
            if (matches.length) {
                console.log(matches);
                let replacement = document.createElement("span");

                let position = 0;
                for (let match of matches) {
                    let prefix = content.substring(position, match.index);
                    replacement.appendChild(document.createTextNode(prefix));

                    let value = match[0];
                    let link = document.createElement("a");
                    link.classList.add("fmmua-glossary");
                    link.appendChild(document.createTextNode(value));
                    replacement.appendChild(link);

                    position = match.index! + value.length;
                }
                let suffix = content.substring(position);
                replacement.appendChild(document.createTextNode(suffix));
                
                node.replaceChild(replacement, child);
            }            
        }
    }
}