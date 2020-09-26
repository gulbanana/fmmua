export default class Cancellation extends Error { 
    constructor() {
        super();
        this.name = "Cancellation";
    }
}