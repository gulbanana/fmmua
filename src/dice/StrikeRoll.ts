interface ChatOptions {
    isPrivate?: boolean;
    user?: string;
    flavor?: string | null;
    template?: string;
    blind?: boolean;
}

export type RollTag = "attack" | "save" | "skilled" | "unskilled";

export class StrikeRoll extends Roll {
    async render(chatOptions: ChatOptions = {}) {
        chatOptions = mergeObject({
          user: game.user._id,
          flavor: null,
          template: Roll.CHAT_TEMPLATE,
          blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;
    
        // Execute the roll, if needed
        if (!this._rolled) this.roll();
        
        // Define chat data
        const chatData = {
          formula: isPrivate ? "???" : this._formula,
          flavor: isPrivate ? null : chatOptions.flavor,
          user: chatOptions.user,
          tooltip: isPrivate ? "" : await this.getTooltip(),
          total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
          d1: this.terms[0] instanceof DiceTerm ? this.terms[0].results[0].result : 0,
          d2: this.terms[0] instanceof Die && this.terms[0].results.length > 1 ? this.terms[0].results[1].result : 0,
          tag: this.terms.length == 1 && this.terms[0] instanceof Die ? this.terms[0].options.flavor : undefined
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template || Roll.CHAT_TEMPLATE, chatData);
    }

    static helper(total: number, d1: number, d2: number, tag: RollTag|undefined): string {
        switch (tag) {
            case "attack":
                return `${total} - ${total == 6 ? "Critical Hit!"
                    : total > 3 ? "Solid Hit"
                    : total == 3 ? "Glancing Hit"
                    : total == 2 ? "Miss"
                    : "Strike!"}`;
    
            case "save":
                return `${total} - ${(total > 3) ? "Success" : "Failure"}`;
    
            case "skilled":
                return `${total} - ${total == 6 ? "Success with a Bonus"
                    : total > 3 ? "Success"
                    : total == 3 ? "Success with a Cost"
                    : total == 2 ? "Twist"
                    : "Twist with a Cost"}`;
    
            case "unskilled":
                if ((d1 == 6 && (d2 == 0 || d2 > 4)) || (d2 == 6 && d1 > 4)) {
                    return `${total} - ${total == 6 ? "Success with a Bonus or learn Skill!" : "Success and learn Skill!" }`;
                } else {
                    return `${total} - ${total == 6 ? "Success with a Bonus"
                        : total > 4 ? "Success"
                        : total == 4 ? "Success with a Cost"
                        : total > 1 ? "Twist"
                        : "Twist with a Cost"}`;
                }

            default:
                return total.toString();
        }
    }
}