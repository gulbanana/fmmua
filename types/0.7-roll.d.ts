/**
 * This class provides an interface and API for conducting dice rolls.
 * The basic structure for a dice roll is a string formula and an object of data against which to parse it.
 *
 * @param formula {String}    The string formula to parse
 * @param data {Object}       The data object against which to parse attributes within the formula
 *
 * @see {@link Die}
 * @see {@link DicePool}
 *
 * @example
 * // Attack with advantage!
 * let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});
 *
 * // The parsed terms of the roll formula
 * console.log(r.terms);    // [Die, +, 2, +, 4]
 *
 * // Execute the roll
 * r.evaluate();
 *
 * // The resulting equation after it was rolled
 * console.log(r.result);   // 16 + 2 + 4
 *
 * // The total resulting from the roll
 * console.log(r.total);    // 22
 */
declare class Roll {
    /**
     * The original provided data
     */
    data: object;

    /**
     * The identified terms of the Roll
     */
    terms: Array<Roll|DicePool|DiceTerm|number|string>;

    /**
     * The original formula before evaluation
     */
    _formula: string;

    /**
     * An array of inner terms which were rolled parenthetically
     */
    _dice: DiceTerm[];

    /**
     * The evaluated results of the Roll
     */
    results: Array<number|string>;

    /**
	 * An internal flag for whether the Roll object has been rolled
	 */
    _rolled: boolean;

    /**
     * Cache the evaluated total to avoid re-evaluating it
     * @type {number|null}
     */
    _total: number|null;

    constructor(formula, data={});

    static create(...args): Roll;

    /**
     * Replace referenced data attributes in the roll formula with values from the provided data.
     * Data references in the formula use the @attr syntax and would reference the corresponding attr key.
     *
     * @param {string} formula          The original formula within which to replace
     * @param {object} data             The data object which provides replacements
     * @param {string} [missing]        The value that should be assigned to any unmatched keys.
     *                                  If null, the unmatched key is left as-is.
     * @param {boolean} [warn]          Display a warning notification when encountering an un-matched key.
     * @static
     */
    static replaceFormulaData(formula, data, {missing, warn=false}={});

    /**
     * Return an Array of the individual DiceTerm instances contained within this Roll.
     * @return {DiceTerm[]}
     */
    get dice();

    /**
     * Return a standardized representation for the displayed formula associated with this Roll.
     * @return {string}
     */
    get formula();

    /**
     * The resulting arithmetic expression after rolls have been evaluated
     * @return {string|null}
     */
    get result();

    /**
     * Return the total result of the Roll expression if it has been evaluated, otherwise null
     * @type {number|null}
     */
    get total();

    /**
     * Alter the Roll expression by adding or multiplying the number of dice which are rolled
     * @param {number} multiply   A factor to multiply. Dice are multiplied before any additions.
     * @param {number} add        A number of dice to add. Dice are added after multiplication.
     * @param {boolean} [multiplyNumeric]  Apply multiplication factor to numeric scalar terms
     * @return {Roll}             The altered Roll expression
     */
    alter(multiply, add, {multiplyNumeric=false}={});

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

  /**
   * Clone the Roll instance, returning a new Roll instance that has not yet been evaluated
   * @return {Roll}
   */
  clone();

  /**
   * Evaluate and return the Roll expression.
   * This function simply calls the evaluate() method but is maintained for backwards compatibility.
   * @return {Roll}   The Roll instance, containing evaluated results and the rolled total.
   */
  roll();

  /**
   * Create a new Roll object using the original provided formula and data
   * Each roll is immutable, so this method returns a new Roll instance using the same data.
   *
   * @return {Roll}    A new Roll object, rolled using the same formula and data
   */
  reroll();

  /**
   * Simulate a roll and evaluate the distribution of returned results
   * @param {string} formula    The Roll expression to simulate
   * @param {number} n          The number of simulations
   * @return {number[]}         The rolled totals
   */
  static simulate(formula, n=10000);

  /**
   * Render the tooltip HTML for a Roll instance
   * @return {Promise<HTMLElement>}
   */
  getTooltip();

  /**
   * Render a Roll instance to HTML
   * @param chatOptions {Object}      An object configuring the behavior of the resulting chat message.
   * @return {Promise.<HTMLElement>}  A Promise which resolves to the rendered HTML
   */
  async render(chatOptions = {});

  /**
   * Transform a Roll instance into a ChatMessage, displaying the roll result.
   * This function can either create the ChatMessage directly, or return the data object that will be used to create.
   *
   * @param {Object} messageData          The data object to use when creating the message
   * @param {string|null} [rollMode=null] The template roll mode to use for the message from CONFIG.Dice.rollModes
   * @param {boolean} [create=true]       Whether to automatically create the chat message, or only return the prepared
   *                                      chatData object.
   * @return {Promise|Object}             A promise which resolves to the created ChatMessage entity, if create is true
   *                                      or the Object of prepared chatData otherwise.
   */
  toMessage(messageData={}, {rollMode=null, create=true}={});

  /**
   * Represent the data of the Roll as an object suitable for JSON serialization.
   * @return {Object}     Structured data which can be serialized into JSON
   */
  toJSON();

  /**
   * Recreate a Roll instance using a provided data object
   * @param {object} data   Unpacked data representing the Roll
   * @return {Roll}         A reconstructed Roll instance
   */
  static fromData(data);

  /**
   * Recreate a Roll instance using a provided JSON string
   * @param {string} json   Serialized JSON data representing the Roll
   * @return {Roll}         A reconstructed Roll instance
   */
  static fromJSON(json);

  /**
   * Construct a new Roll object from a parenthetical term of an outer Roll.
   * @param {string} term     The isolated parenthetical term, for example (4d6)
   * @param {object} data     The Roll data object, provided by the outer Roll
   * @return {Roll}           An inner Roll object constructed from the term
   */
  static fromTerm(term, data);

  static ARITHMETIC: [string];
  static MATH_PROXY: Math;
  static PARENTHETICAL_RGX: RegExp;
  static CHAT_TEMPLATE: string;
  static TOOLTIP_TEMPLATE: string;
}
