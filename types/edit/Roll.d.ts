// add members missing from foundry-pc-types

declare namespace Roll {
    export var ARITHMETIC: [string];
    export var MATH_PROXY: Math;
    export var PARENTHETICAL_RGX: RegExp;
    export var CHAT_TEMPLATE: string;
    export var TOOLTIP_TEMPLATE: string;

    export function create(...args): Roll;
}

declare interface Roll {
    /**
     * Execute the Roll, replacing dice and evaluating the total result
     *
     * @param {boolean} [minimize]    Produce the minimum possible result from the Roll instead of a random result.
     * @param {boolean} [maximize]    Produce the maximum possible result from the Roll instead of a random result.
     *
     * @returns {Roll}    The rolled Roll object, able to be chained into other methods
     *
     * @example
     * let r = new Roll("2d6 + 4 + 1d4");
     * r.evaluate();
     * console.log(r.result); // 5 + 4 + 2
     * console.log(r.total);  // 11
     */
    evaluate({minimize=false, maximize=false}={}): Roll;
}