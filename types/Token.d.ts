// foundry-pc-types has an incomplete version; handwritten replacement

declare interface TokenBar {
    attribute: string;
}

declare interface TokenData {
    name: string;
    x: number;
    y: number;
    displayName: number;
    img: string;
    width: number;
    height: number;
    scale: number;
    elevation: number;
    lockRotation: boolean;
    rotation: number,
    effects: string[],
    overlayEffect: string,
    vision: boolean,
    dimSight: number,
    brightSight: number,
    dimLight: number,
    brightLight: number,
    sightAngle: number,
    hidden: boolean,
    actorId: string,
    actorLink: boolean,
    actorData: ActorData,
    disposition: number,
    displayBars: number,
    bar1: TokenBar | null,
    bar2: TokenBar | null
};

/**
 * A Token is an implementation of PlaceableObject which represents an Actor within a viewed Scene on the game canvas.
 * @extends  {PlaceableObject}
 *
 * @example
 * Token.create({
 *   name: "Token Name",
 *   x: 1000,
 *   y: 1000,
 *   displayName: 3,
 *   img: "path/to/token-artwork.png",
 *   width: 2,
 *   height: 2,
 *   scale: 1.2,
 *   elevation: 50,
 *   lockRotation: false,
 *   rotation: 30,
 *   effects: ["icons/stun.png"],
 *   overlayEffect: "icons/dead.png",
 *   vision: true,
 *   dimSight: 60,
 *   brightSight: 0,
 *   dimLight: 40,
 *   brightLight: 20,
 *   sightAngle: 60,
 *   hidden: false,
 *   actorId: "dfgkjt43jkvdfkj34t",
 *   actorLink: true,
 *   actorData: {},
 *   disposition: 1,
 *   displayBars: 3,
 *   bar1: {attribute: "attributes.hp"},
 *   bar2: {attribute: "attributes.sp"}
 * }
 */
declare class Token extends PlaceableObject<TokenData> {
    /**
     * A Ray which represents the Token's current movement path
     */
    _movement: Ray;

    /**
     * An Object which records the Token's prior velocity dx and dy
     * This can be used to determine which direction a Token was previously moving
     */
    _velocity: {
      dx: number,
      dy: number,
      sx: number,
      sy: number
    };

    /**
     * The Token's most recent valid position
     */
    _validPosition: {
      x: number;
      y: number;
    };

    /**
     * Provide a temporary flag through which th6is Token can be overridden to bypass any movement animation
     */
    _noAnimate: boolean;

    /**
     * Track the set of User entities which are currently targeting this Token
     */
    targeted: Set<User>;

    /**
     * An Actor entity constructed using this Token's data
     * If actorLink is true, then the entity is the true Actor entity
     * Otherwise, the Actor entity is a synthetic, constructed using the Token actorData
     */
    actor: Actor;

    /**
     * A reference to the SightLayerSource object which defines this light source area of effect
     */
    lightSource: SightLayerSource|null;

    constructor(data: TokenData, scene: Scene);
  
    /** @override */
    static get embeddedName(): string;
  
    /**
     * A Boolean flag for whether the current game User has permission to control this token
     */
    get owner(): boolean;
    
    /**
     * A boolean flag for whether the current game User has observer permission for the Token
     */
    get observer(): boolean;
    
    /**
     * Is the HUD display active for this token?
     */
    get hasActiveHUD(): boolean;
    
    /**
     * Convenience access to the token's nameplate string
     */
    get name(): string;
  
    /**
     * Translate the token's grid width into a pixel width based on the canvas size
     */
    get w(): number;
  
    /**
     * Translate the token's grid height into a pixel height based on the canvas size
     */
    get h(): number;
  
  
    /**
     * The Token's current central position
     */
    get center(): {
      x: number; 
      y: number;
    };
  
    /**
     * An indicator for whether or not this token is currently involved in the active combat encounter.
     */
    get inCombat(): boolean;
  
  
    /**
     * An indicator for whether the Token is currently targeted by the active game User
     */
    get isTargeted(): boolean;
    
    /**
     * Determine whether the Token is visible to the calling user's perspective.
     * Hidden Tokens are only displayed to GM Users.
     * Non-hidden Tokens are always visible if Token Vision is not required.
     * Controlled tokens are always visible.
     * All Tokens are visible to a GM user if no Token is controlled.
     *
     * @see {SightLayer#testVisibility}
     */
    get isVisible(): boolean;
  
    /**
     * Test whether the Token has sight (or blindness) at any radius
     */
    get hasSight(): boolean;
  
    /**
     * Test whether the Token emits light (or darkness) at any radius
     */
    get emitsLight(): boolean;
  
    /**
     * Test whether the Token has a limited angle of vision or light emission which would require sight to update on Token rotation
     */
    get hasLimitedVisionAngle(): boolean;
  
  
    /**
     * Translate the token's sight distance in units into a radius in pixels.
     */
    get dimRadius(): number;
  
  
    /**
     * The radius of dim light that the Token emits
     */
    get dimLightRadius(): number;
  
  
    /**
     * Translate the token's bright light distance in units into a radius in pixels.
     */
    get brightRadius(): number;

    /**
     * The radius of bright light that the Token emits
     */
    get brightLightRadius(): number;
  
    /**
     * Update display of the Token, pulling latest data and re-rendering the display of Token components
     */
    refresh(): void;
  
    /**
     * A helper method to retrieve the underlying data behind one of the Token's attribute bars
     * @param {string} barName        The named bar to retrieve the attribute for
     * @param {string} alternative    An alternative attribute path to get instead of the default one
     */
    getBarAttribute(barName: string, {alternative}: string={}): {
      type: string,
      attribute: any,
      value: number,
      max?: number
    }|null;
  
  
    /**
     * Refresh the display of Token attribute bars, rendering latest resource data
     * If the bar attribute is valid (has a value and max), draw the bar. Otherwise hide it.
     */
    drawBars(): void;
  
    /**
     * Draw a text tooltip for the token which can be used to display Elevation or a resource value
     */
    drawTooltip(): void;
    
    /**
     * Draw the active effects and overlay effect icons which are present upon the Token
     */
    async drawEffects(): Promise<void>;
    
    /**
     * Terminate animation of this particular Token
     */
    stopAnimation();

    /**
     * Check for collision when attempting a move to a new position
     * @param {Object} destination  An Object containing data for the attempted movement
     * @param {boolean} drag        Whether we are checking collision for a drag+drop movement
     */
    checkCollision(destination: object): boolean;
  
    /* -------------------------------------------- */
  
    /** @override */
    clone(): Token;
  
    /**
     * Get the center-point coordinate for a given grid position
     * @param {number} x    The grid x-coordinate that represents the top-left of the Token
     * @param {number} y    The grid y-coordinate that represents the top-left of the Token
     */
    getCenter(x: number, y: number): {
      x: number;
      y: number;
    };
  
    /* -------------------------------------------- */
  
    /**
     * Set the token's position by comparing its center position vs the nearest grid vertex
     * Return a Promise that resolves to the Token once the animation for the movement has been completed
     * @param {number} x            The x-coordinate of the token center
     * @param {number} y            The y-coordinate of the token center
     * @param {boolean} [animate]   Animate the movement path, default is true
     */
    async setPosition(x: number, y: number, {animate=true}: boolean={}): Promise<Token>;

    /**
     * Set this Token as an active target for the current game User
     * @param {boolean} targeted        Is the Token now targeted?
     * @param {User|null} user          Assign the token as a target for a specific User
     * @param {boolean} releaseOthers   Release other active targets for the same player?
     * @param {boolean} groupSelection  Is this target being set as part of a group selection workflow?
     */
    setTarget(targeted: boolean=true, {user=null, releaseOthers: boolean=true, groupSelection: boolean=false}: User | null={}): void;
  
  
    /**
     * Add or remove the currently controlled Tokens from the active combat encounter
     * @param {Combat|null} combat    A Combat encounter from which to add or remove the Token
     */
    async toggleCombat(combat: Combat | null=null): Promise<Token>;
  
    /* -------------------------------------------- */
  
    /**
     * Toggle an active effect by it's texture path.
     * Copy the existing Array in order to ensure the update method detects the data as changed.
     *
     * @param {string} texture      The texture file-path of the effect icon to toggle on the Token.
     * @return {Promise<boolean>}   Was the texture applied (true) or removed (false)
     */
    async toggleEffect(texture: string): Promise<boolean>;
  
    /* -------------------------------------------- */
  
    /**
     * Set or remove the overlay texture for the Token by providing a new texture path
     * @param {string} texture      The texture file-path of the effect to set as the Token overlay icon
     * @return {Promise<boolean>}   Was the texture applied (true) or removed (false)
     */
    async toggleOverlay(texture: string): Promise<boolean>;
  
    /* -------------------------------------------- */
  
    /**
     * Toggle the visibility state of any Tokens in the currently selected set
     */
    async toggleVisibility(): Promise<any>;
  
    /* -------------------------------------------- */
  
    /**
     * Return the token's sight origin, tailored for the direction of their movement velocity to break ties with walls
     * @return {Object}
     */
    getSightOrigin(): {
      x: number;
      y: number;
    };
  
    /* -------------------------------------------- */
  
    /**
     * A generic transformation to turn a certain number of grid units into a radius in canvas pixels.
     * This function adds additional padding to the light radius equal to half the token width.
     * This causes light to be measured from the outer token edge, rather than from the center-point.
     * @param units {Number}  The radius in grid units
     * @return {number}       The radius in canvas units
     */
    getLightRadius(units: number): number;
  
  
    /**
     * Perform an incremental token movement, shifting the token's position by some number of grid units.
     * The offset parameters will move the token by that number of grid spaces in one or both directions.
     *
     * @param {number} dx         The number of grid units to shift along the X-axis
     * @param {number} dy         The number of grid units to shift along the Y-axis
     * @return {Promise}
     */
    async shiftPosition(dx: number, dy: number): Promise<Token>;
  }