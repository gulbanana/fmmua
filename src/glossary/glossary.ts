export function init() {    
    Hooks.on("renderChatMessage", onRenderChatMessage);

    game.settings.register("fmmua", "glossaryChatLinks", {
        name: "fmmua.settings.glossaryChatLinks",
        hint: "fmmua.settings.glossaryChatLinksHint",
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
        onChange: refreshChatLog
    });
}

function onRenderChatMessage(_app: Application, html: JQuery<HTMLElement>, _data: any) {
    if (game.settings.get("fmmua", "glossaryChatLinks")) {    
        let content = html.find(".message-content");
        if (content.length > 0 && content[0] instanceof HTMLElement) {
            walkDom(content[0]);
        }
    }
}

let dominated = new RegExp("incapacitated?|dominated?", "ig");

function walkDom(node: HTMLElement) {
    for (let child of node.childNodes) {
        if (child instanceof HTMLElement) {
            walkDom(child);
        } else if (child instanceof Text) {
            insertLinks(node, child);
        }
    }
}

function insertLinks(parent: Element, child: Text) {
    let content = child.nodeValue!;
    let matches = Array.from(content.matchAll(dominated));
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
            replacement.appendChild(link);

            position = match.index! + value.length;
        }
        let suffix = content.substring(position);
        replacement.appendChild(document.createTextNode(suffix));
        
        parent.replaceChild(replacement, child);
    }    
}

async function refreshChatLog() {
    let logQuery = ui.chat.element.find("#chat-log");
    if (logQuery.length == 0) return;

    for (let messageElement of logQuery[0].children) {
        if (messageElement instanceof HTMLElement) {
            let messageId = messageElement.dataset["messageId"] || "";
            let message = game.messages.get(messageId);
            let replacementQuery = await message?.render();
            if (replacementQuery?.length > 0) {
                logQuery[0].replaceChild(replacementQuery[0], messageElement);
            }
        }            
    }    
}