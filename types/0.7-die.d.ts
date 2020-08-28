/**
 * Define a fair n-sided die term that can be used as part of a Roll formula
 * @implements {DiceTerm}
 *
 * @example
 * // Roll 4 six-sided dice
 * let die = new Die({faces: 6, number: 4}).evaluate();
 */
declare class Die extends DiceTerm {

    /**
     * @deprecated since 0.7.0
     * TODO: Remove in 0.8.x
     * @see {@link Die#results}
     */
    get rolls() {
      console.warn(`You are using the Die#rolls attribute which is deprecated in favor of Die#results.`);
      return this.results;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    get total() {
      const total = super.total;
      if ( this.options.marginSuccess ) return total - parseInt(this.options.marginSuccess);
      else if ( this.options.marginFailure ) return parseInt(this.options.marginFailure) - total;
      else return total;
    }
  
    /* -------------------------------------------- */
    /*  Term Modifiers                              */
    /* -------------------------------------------- */
  
    /**
     * Re-roll the Die, rolling additional results for any values which fall within a target set.
     * If no target number is specified, re-roll the lowest possible result.
     *
     * 20d20r         reroll all 1s
     * 20d20r1        reroll all 1s
     * 20d20r=1       reroll all 1s
     * 20d20r1=1      reroll a single 1
     *
     * @param {string} modifier     The matched modifier query
     */
    reroll(modifier) {
  
      // Match the re-roll modifier
      const rgx = /[rR]([0-9]+)?([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [max, comparison, target] = match.slice(1);
  
      // If no comparison was set, treat the max as the target
      if ( !comparison ) {
        target = max;
        max = null;
      }
  
      // Determine threshold values
      max = parseInt(max) || this.results.length;
      target = parseInt(target) || 1;
      comparison = comparison || "=";
  
      // Re-roll results from the initial set to a maximum number of times
      const n = this.results.length;
      for ( let i=0; i<n; i++ ) {
        let r = this.results[i];
        if (!r.active) continue;
  
        // Maybe we have run out of re-rolls
        if (max <= 0) break;
  
        // Determine whether to re-roll the result
        if ( DiceTerm.compareResult(r.result, comparison, target) ) {
          r.rerolled = true;
          r.active = false;
          this.roll();
          max -= 1;
        }
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Explode the Die, rolling additional results for any values which match the target set.
     * If no target number is specified, explode the highest possible result.
     * Explosion can be a "small explode" using a lower-case x or a "big explode" using an upper-case "X"
     *
     * @param {string} modifier     The matched modifier query
     * @param {boolean} recursive   Explode recursively, such that new rolls can also explode?
     */
    explode(modifier, {recursive=true}={}) {
  
      // Match the explode or "explode once" modifier
      const rgx = /[xX][oO]?([0-9]+)?([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [max, comparison, target] = match.slice(1);
  
      // If no comparison was set, treat the max as the target
      if ( !comparison ) {
        target = max;
        max = null;
      }
  
      // Determine threshold values
      max = parseInt(max) || null;
      target = parseInt(target) || this.faces;
      comparison = comparison || "=";
  
      // Recursively explode until there are no remaining results to explode
      let checked = 0;
      let initial = this.results.length;
      while ( checked < this.results.length ) {
        let r = this.results[checked];
        checked++;
        if (!r.active) continue;
  
        // Maybe we have run out of explosions
        if ( (max !== null) && (max <= 0) ) break;
  
        // Determine whether to explode the result and roll again!
        if ( DiceTerm.compareResult(r.result, comparison, target) ) {
          r.exploded = true;
          this.roll();
          if ( max !== null ) max -= 1;
        }
  
        // Limit recursion if it's a "small explode"
        if ( !recursive && (checked >= initial) ) checked = this.results.length;
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * @see {@link Die#explode}
     */
    explodeOnce(modifier) {
      return this.explode(modifier, {recursive: false});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Keep a certain number of highest or lowest dice rolls from the result set.
     *
     * 20d20k       Keep the 1 highest die
     * 20d20kh      Keep the 1 highest die
     * 20d20kh10    Keep the 10 highest die
     * 20d20kl      Keep the 1 lowest die
     * 20d20kl10    Keep the 10 lowest die
     *
     * @param {string} modifier     The matched modifier query
     */
    keep(modifier) {
      const rgx = /[kK]([hHlL])?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [direction, number] = match.slice(1);
      direction = direction ? direction.toLowerCase() : "h";
      number = parseInt(number) || 1;
      DiceTerm._keepOrDrop(this.results, number, {keep: true, highest: direction === "h"});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Drop a certain number of highest or lowest dice rolls from the result set.
     *
     * 20d20d       Drop the 1 lowest die
     * 20d20dh      Drop the 1 highest die
     * 20d20dl      Drop the 1 lowest die
     * 20d20dh10    Drop the 10 highest die
     * 20d20dl10    Drop the 10 lowest die
     *
     * @param {string} modifier     The matched modifier query
     */
    drop(modifier) {
      const rgx = /[dD]([hHlL])?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [direction, number] = match.slice(1);
      direction = direction ? direction.toLowerCase() : "l";
      number = parseInt(number) || 1;
      DiceTerm._keepOrDrop(this.results, number, {keep: false, highest: direction !== "l"});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Count the number of successful results which occurred in a given result set.
     * Successes are counted relative to some target, or relative to the maximum possible value if no target is given.
     * Applying a count-success modifier to the results re-casts all results to 1 (success) or 0 (failure)
     *
     * 20d20cs      Count the number of dice which rolled a 20
     * 20d20cs>10   Count the number of dice which rolled higher than 10
     * 20d20cs<10   Count the number of dice which rolled less than 10
     *
     * @param {string} modifier     The matched modifier query
     */
    countSuccess(modifier) {
      const rgx = /(?:cs|CS)([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [comparison, target] = match.slice(1);
      comparison = comparison || "=";
      target = parseInt(target) || this.faces;
      DiceTerm._applyCount(this.results, comparison, target, {flagSuccess: true});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Count the number of failed results which occurred in a given result set.
     * Failures are counted relative to some target, or relative to the lowest possible value if no target is given.
     * Applying a count-failures modifier to the results re-casts all results to 1 (failure) or 0 (non-failure)
     *
     * 6d6cf      Count the number of dice which rolled a 1 as failures
     * 6d6cf<=3   Count the number of dice which rolled less than 3 as failures
     * 6d6cf>4    Count the number of dice which rolled greater than 4 as failures
     *
     * @param {string} modifier     The matched modifier query
     */
    countFailures(modifier) {
      const rgx = /(?:cf|CF)([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [comparison, target] = match.slice(1);
      comparison = comparison || "=";
      target = parseInt(target) || 1;
      DiceTerm._applyCount(this.results, comparison, target, {flagFailure: true});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Deduct the number of failures from the dice result, counting each failure as -1
     * Failures are identified relative to some target, or relative to the lowest possible value if no target is given.
     * Applying a deduct-failures modifier to the results counts all failed results as -1.
     *
     * 6d6df      Subtract the number of dice which rolled a 1 from the non-failed total.
     * 6d6cs>3df  Subtract the number of dice which rolled a 3 or less from the non-failed count.
     * 6d6cf<3df  Subtract the number of dice which rolled less than 3 from the non-failed count.
     *
     * @param {string} modifier     The matched modifier query
     */
    deductFailures(modifier) {
      const rgx = /(?:df|DF)([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [comparison, target] = match.slice(1);
      if ( comparison || target ) {
        comparison = comparison || "=";
        target = parseInt(target) || 1;
      }
      DiceTerm._applyDeduct(this.results, comparison, target, {deductFailure: true});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Subtract the value of failed dice from the non-failed total, where each failure counts as its negative value.
     * Failures are identified relative to some target, or relative to the lowest possible value if no target is given.
     * Applying a deduct-failures modifier to the results counts all failed results as -1.
     *
     * 6d6df<3    Subtract the value of results which rolled less than 3 from the non-failed total.
     *
     * @param {string} modifier     The matched modifier query
     */
    subtractFailures(modifier) {
      const rgx = /(?:sf|SF)([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [comparison, target] = match.slice(1);
      if ( comparison || target ) {
        comparison = comparison || "=";
        target = parseInt(target) || 1;
      }
      DiceTerm._applyDeduct(this.results, comparison, target, {invertFailure: true});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Subtract the total value of the DiceTerm from a target value, treating the difference as the final total.
     * Example: 6d6ms>12    Roll 6d6 and subtract 12 from the resulting total.
     * @param {string} modifier     The matched modifier query
     */
    marginSuccess(modifier) {
      const rgx = /(?:ms|MS)([<>=]+)?([0-9]+)?/;
      const match = modifier.match(rgx);
      if ( !match ) return this;
      let [comparison, target] = match.slice(1);
      target = parseInt(target);
      if ( [">", ">=", "=", undefined].includes(comparison) ) this.options["marginSuccess"] = target;
      else if ( ["<", "<="].includes(comparison) ) this.options["marginFailure"] = target;
    }
  }