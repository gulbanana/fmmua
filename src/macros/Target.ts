export default class Target {
    token: Token;
    advantage: boolean;
    disadvantage: boolean;

    constructor(token: Token, advantage: boolean, disadvantage: boolean) {
        this.token = token;
        this.advantage = advantage;
        this.disadvantage = disadvantage;
    }
}