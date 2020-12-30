// add typings for options and result

declare interface TermOptions {
  flavor?: string;
  marginSuccess?: string;
  marginFailure?: string;
}

declare interface TermResult {
  result: number;
  active: boolean;
  count?: number;
  success?: boolean;
  failure?: boolean;
}

declare interface DiceTerm {  
    /**
     * An object of additional options which modify the dice term
     */
    options: TermOptions;

    /**
     * The array of dice term results which have been rolled
     */
    results: TermResult[];
}