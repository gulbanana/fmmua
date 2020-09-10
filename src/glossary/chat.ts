import insertLinks from "./insertLinks.js";

export function onRenderChatMessage(_app: Application, html: JQuery<HTMLElement>, _data: any) {
    if (game.settings.get("fmmua", "glossaryChatLinks")) {    
        let content = html.find(".message-content");
        if (content.length > 0 && content[0] instanceof HTMLElement) {
            insertLinks(content[0]);
        }
    }
}

export async function refreshLog() {
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