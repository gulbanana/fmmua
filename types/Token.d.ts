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
class Token extends PlaceableObject {
    constructor(...args) {
      super(...args);
  
      /**
       * A Ray which represents the Token's current movement path
       * @type {Ray}
       * @private
       */
      this._movement = null;
  
      /**
       * An Object which records the Token's prior velocity dx and dy
       * This can be used to determine which direction a Token was previously moving
       * @type {Object}
       * @private
       */
      this._velocity = {
        dx: null,
        dy: null,
        sx: null,
        sy: null
      };
  
      /**
       * The Token's most recent valid position
       * @type {Object}
       * @private
       */
      this._validPosition = {x: this.data.x, y: this.data.y};
  
      /**
       * Provide a temporary flag through which th6is Token can be overridden to bypass any movement animation
       * @type {boolean}
       */
      this._noAnimate = false;
  
      /**
       * Track the set of User entities which are currently targeting this Token
       * @type {Set.<User>}
       */
      this.targeted = new Set([]);
  
      /**
       * An Actor entity constructed using this Token's data
       * If actorLink is true, then the entity is the true Actor entity
       * Otherwise, the Actor entity is a synthetic, constructed using the Token actorData
       * @type {Actor}
       */
      this.actor = Actor.fromToken(this);
  
      /**
       * A reference to the SightLayerSource object which defines this light source area of effect
       * @type {SightLayerSource|null}
       */
      this.lightSource = null;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    static get embeddedName() {
      return "Token";
    }
  
    /* -------------------------------------------- */
    /*  Permission Attributes
    /* -------------------------------------------- */
  
    /**
     * A Boolean flag for whether the current game User has permission to control this token
     * @type {boolean}
     */
    get owner() {
      if ( game.user.isGM ) return true;
      return this.actor ? this.actor.owner : false;
    }
  
    /* -------------------------------------------- */
  
    /**
     * A boolean flag for whether the current game User has observer permission for the Token
     * @type {boolean}
     */
    get observer() {
      return game.user.isGM || (this.actor && this.actor.hasPerm(game.user, "OBSERVER"));
    }
  
    /* -------------------------------------------- */
  
    /**
     * Is the HUD display active for this token?
     * @return {boolean}
     */
    get hasActiveHUD() {
      return this.layer.hud.object === this;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Convenience access to the token's nameplate string
     * @type {string}
     */
    get name() {
      return this.data.name;
    }
  
    /* -------------------------------------------- */
    /*  Rendering Attributes
    /* -------------------------------------------- */
  
    /**
     * Translate the token's grid width into a pixel width based on the canvas size
     * @type {number}
     */
    get w() {
      return this.data.width * canvas.grid.w;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Translate the token's grid height into a pixel height based on the canvas size
     * @type {number}
     */
    get h() {
      return this.data.height * canvas.grid.h;
    }
  
    /* -------------------------------------------- */
  
    /**
     * The Token's current central position
     * @property x The central x-coordinate
     * @property y The central y-coordinate
     * @type {Object}
     */
    get center() {
      return this.getCenter(this.data.x, this.data.y);
    }
  
    /* -------------------------------------------- */
    /*  State Attributes
    /* -------------------------------------------- */
  
    /**
     * An indicator for whether or not this token is currently involved in the active combat encounter.
     * @type {boolean}
     */
    get inCombat() {
      const combat = ui.combat.combat;
      if ( !combat ) return false;
      const combatant = combat.getCombatantByToken(this.id);
      return combatant !== undefined;
    }
  
    /* -------------------------------------------- */
  
    /**
     * An indicator for whether the Token is currently targeted by the active game User
     * @type {boolean}
     */
    get isTargeted() {
      return this.targeted.has(game.user);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Determine whether the Token is visible to the calling user's perspective.
     * Hidden Tokens are only displayed to GM Users.
     * Non-hidden Tokens are always visible if Token Vision is not required.
     * Controlled tokens are always visible.
     * All Tokens are visible to a GM user if no Token is controlled.
     *
     * @see {SightLayer#testVisibility}
     * @type {boolean}
     */
    get isVisible() {
      const gm = game.user.isGM;
      if ( this.data.hidden ) return gm;
      if (!canvas.sight.tokenVision) return true;
      if ( this._controlled ) return true;
      const tolerance = Math.min(this.w, this.h) / 4;
      return canvas.sight.testVisibility(this.center, {tolerance});
    }
  
    /* -------------------------------------------- */
    /*  Lighting and Vision Attributes
    /* -------------------------------------------- */
  
    /**
     * Test whether the Token has sight (or blindness) at any radius
     * @type {boolean}
     */
    get hasSight() {
      return this.data.vision;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Test whether the Token emits light (or darkness) at any radius
     * @type {boolean}
     */
    get emitsLight() {
      return ["dimLight", "brightLight"].some(a => this.data[a] !== 0);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Test whether the Token has a limited angle of vision or light emission which would require sight to update on Token rotation
     * @type {boolean}
     */
    get hasLimitedVisionAngle() {
      return (this.hasSight && (this.data.sightAngle !== 360)) || (this.emitsLight && (this.data.lightAngle !== 360));
    }
  
    /* -------------------------------------------- */
  
    /**
     * Translate the token's sight distance in units into a radius in pixels.
     * @return {number}     The sight radius in pixels
     */
    get dimRadius() {
      let r = Math.abs(this.data.dimLight) > Math.abs(this.data.dimSight) ? this.data.dimLight : this.data.dimSight;
      return this.getLightRadius(r);
    }
  
    /* -------------------------------------------- */
  
    /**
     * The radius of dim light that the Token emits
     * @return {number}
     */
    get dimLightRadius() {
      let r = Math.abs(this.data.dimLight) > Math.abs(this.data.brightLight) ? this.data.dimLight : this.data.brightLight;
      return this.getLightRadius(r);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Translate the token's bright light distance in units into a radius in pixels.
     * @return {number}       The bright radius in pixels
     */
    get brightRadius() {
      let r = Math.abs(this.data.brightLight) > Math.abs(this.data.brightSight) ? this.data.brightLight :
        this.data.brightSight;
      return this.getLightRadius(r);
    }
  
    /* -------------------------------------------- */
  
    /**
     * The radius of bright light that the Token emits
     * @return {number}
     */
    get brightLightRadius() {
      return this.getLightRadius(this.data.brightLight);
    }
  
    /* -------------------------------------------- */
    /* Rendering
    /* -------------------------------------------- */
  
    /** @override */
    async draw() {
      this.clear();
      if ( this.hasActiveHUD ) canvas.tokens.hud.clear();
  
      // Draw the token as invisible so it will be safely revealed later
      this.visible = false;
  
      // Load token texture
      this.texture = await loadTexture(this.data.img, {fallback: CONST.DEFAULT_TOKEN});
  
      // Draw Token components
      this.border = this.addChild(new PIXI.Graphics());
      this.icon = this.addChild(await this._drawIcon());
      this.bars = this.addChild(this._drawAttributeBars());
      this.nameplate = this.addChild(this._drawNameplate());
      this.tooltip = this.addChild(new PIXI.Container());
      this.effects = this.addChild(new PIXI.Container());
      this.target = this.addChild(new PIXI.Graphics());
  
      // Define initial interactivity and visibility state
      this.hitArea = new PIXI.Rectangle(0, 0, this.w, this.h);
      this.buttonMode = true;
  
      // Constrain initial position
      const d = canvas.dimensions;
      this.data.x = Math.clamped(this.data.x, 0, d.width - this.w);
      this.data.y = Math.clamped(this.data.y, 0, d.height - this.h);
  
      // Draw the initial position
      this.refresh();
      await this.drawEffects();
      this.drawTooltip();
      this.drawBars();
  
      // Enable interactivity, only if the Tile has a true ID
      if ( this.id ) this.activateListeners();
      return this;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw resource bars for the Token
     * @private
     */
    _drawAttributeBars() {
      const bars = new PIXI.Container();
      bars.bar1 = bars.addChild(new PIXI.Graphics());
      bars.bar2 = bars.addChild(new PIXI.Graphics());
      return bars;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw the Sprite icon for the Token
     * @return {Promise}
     * @private
     */
    async _drawIcon() {
  
      // Create Sprite using the loaded texture
      let icon = new PIXI.Sprite(this.texture);
      icon.anchor.set(0.5, 0.5);
      if ( !this.texture ) return icon;
  
      // Ensure playback state for video tokens
      const source = getProperty(this.texture, "baseTexture.resource.source");
      if ( source && (source.tagName === "VIDEO") ) {
        source.loop = true;
        source.muted = true;
        source.currentTime = 0;
        game.video.play(source);
      }
  
      // Apply color tinting
      icon.tint = this.data.tint ? colorStringToHex(this.data.tint) : 0xFFFFFF;
      return icon;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Update display of the Token, pulling latest data and re-rendering the display of Token components
     */
    refresh() {
  
      // Token position and visibility
      if ( !this._movement ) this.position.set(this.data.x, this.data.y);
  
      // Size the texture aspect ratio within the token frame
      const tex = this.texture;
      if ( tex ) {
        let aspect = tex.width / tex.height;
        if ( aspect >= 1 ) {
          this.icon.width = this.w * this.data.scale;
          this.icon.scale.y = this.icon.scale.x;
        } else {
          this.icon.height = this.h * this.data.scale;
          this.icon.scale.x = this.icon.scale.y;
        }
      }
  
      // Mirror horizontally or vertically
      this.icon.scale.x = Math.abs(this.icon.scale.x) * (this.data.mirrorX ? -1 : 1);
      this.icon.scale.y = Math.abs(this.icon.scale.y) * (this.data.mirrorY ? -1 : 1);
  
      // Set rotation, position, and opacity
      this.icon.rotation = toRadians(this.data.lockRotation ? 0 : this.data.rotation);
      this.icon.position.set(this.w / 2, this.h / 2);
      this.icon.alpha = this.data.hidden ? 0.5 : 1.0;
  
      // Refresh Token border and target
      this._refreshBorder();
      this._refreshTarget();
  
      // Refresh nameplate and resource bars
      this.nameplate.visible = this._canViewMode(this.data.displayName);
      this.bars.visible = this._canViewMode(this.data.displayBars);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw the Token border, taking into consideration the grid type and border color
     * @private
     */
    _refreshBorder() {
      this.border.clear();
      const borderColor = this._getBorderColor();
      if( !borderColor ) return;
  
      // Draw Hex border for size 1 tokens on a hex grid
      const {width, height} = this.data;
      const gt = CONST.GRID_TYPES;
      const hexTypes = [gt.HEXEVENQ, gt.HEXEVENR, gt.HEXODDQ, gt.HEXODDR];
      if ( hexTypes.includes(canvas.grid.type) && (width === 1) && (height ===1) ) {
        const g = canvas.grid.grid;
        const polygon = [gt.HEXEVENR, gt.HEXODDR].includes(canvas.grid.type) ?
          g.getPointyHexPolygon(-1, -1, this.w+2, this.h+2) :
          g.getFlatHexPolygon(-1, -1, this.w+2, this.h+2);
        this.border.lineStyle(4, 0x000000, 0.8).drawPolygon(polygon);
        this.border.lineStyle(2, borderColor || 0xFF9829, 1.0).drawPolygon(polygon);
      }
  
      // Otherwise Draw Square border
      else {
        this.border.lineStyle(4, 0x000000, 0.8).drawRoundedRect(-1, -1, this.w+2, this.h+2, 3);
        this.border.lineStyle(2, borderColor || 0xFF9829, 1.0).drawRoundedRect(-1, -1, this.w+2, this.h+2, 3);
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Get the hex color that should be used to render the Token border
     * @return {*}
     * @private
     */
    _getBorderColor() {
      if ( this._controlled ) return 0xFF9829;                    // Controlled
      else if ( this._hover ) {
        let d = parseInt(this.data.disposition);
        if (!game.user.isGM && this.owner) return 0xFF9829;       // Owner
        else if (this.actor && this.actor.isPC) return 0x33BC4E;  // Party Member
        else if (d === 1) return 0x43DFDF;                        // Friendly NPC
        else if (d === 0) return 0xF1D836;                        // Neutral NPC
        else return 0xE72124;                                     // Hostile NPC
      }
      else return null;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Refresh the target indicators for the Token.
     * Draw both target arrows for the primary User as well as indicator pips for other Users targeting the same Token.
     * @private
     */
    _refreshTarget() {
      this.target.clear();
      if ( !this.targeted.size ) return;
  
      // Determine whether the current user has target and any other users
      const [others, user] = Array.from(this.targeted).partition(u => u === game.user);
      const userTarget = user.length;
  
      // For the current user, draw the target arrows
      if ( userTarget ) {
        let p = 4;
        let aw = 12;
        let h = this.h;
        let hh = h / 2;
        let w = this.w;
        let hw = w / 2;
        let ah = canvas.dimensions.size / 3;
        this.target.beginFill(0xFF9829, 1.0).lineStyle(1, 0x000000)
          .drawPolygon([-p,hh, -p-aw,hh-ah, -p-aw,hh+ah])
          .drawPolygon([w+p,hh, w+p+aw,hh-ah, w+p+aw,hh+ah])
          .drawPolygon([hw,-p, hw-ah,-p-aw, hw+ah,-p-aw])
          .drawPolygon([hw,h+p, hw-ah,h+p+aw, hw+ah,h+p+aw]);
      }
  
      // For other users, draw offset pips
      for ( let [i, u] of others.entries() ) {
        let color = colorStringToHex(u.data.color);
        this.target.beginFill(color, 1.0).lineStyle(2, 0x0000000).drawCircle(2 + (i * 8), 0, 6);
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * A helper method to retrieve the underlying data behind one of the Token's attribute bars
     * @param {string} barName        The named bar to retrieve the attribute for
     * @param {string} alternative    An alternative attribute path to get instead of the default one
     * @return {Object|null}          The attribute displayed on the Token bar, if any
     */
    getBarAttribute(barName, {alternative}={}) {
      const attr = alternative || (barName ? this.data[barName].attribute : null);
      if ( !attr || !this.actor ) return null;
      let data = getProperty(this.actor.data.data, attr);
  
      // Single values
      if ( Number.isFinite(data) ) {
        return {
          type: "value",
          attribute: attr,
          value: data
        }
      }
  
      // Attribute objects
      else if ( (typeof data === "object") && ("value" in data) && ("max" in data) ) {
        data = duplicate(data);
        return {
          type: "bar",
          attribute: attr,
          value: parseInt(data.value || 0),
          max: parseInt(data.max || 0)
        }
      }
  
      // Otherwise null
      return null;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Refresh the display of Token attribute bars, rendering latest resource data
     * If the bar attribute is valid (has a value and max), draw the bar. Otherwise hide it.
     * @private
     */
    drawBars() {
      if ( !this.actor || (this.data.displayBars === CONST.TOKEN_DISPLAY_MODES.NONE) ) return;
      ["bar1", "bar2"].forEach((b, i) => {
        const bar = this.bars[b];
        const attr = this.getBarAttribute(b);
        if ( !attr || (attr.type !== "bar") ) return bar.visible = false;
        this._drawBar(i, bar, attr);
        bar.visible = true;
      });
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw a single resource bar, given provided data
     * @param {number} number       The Bar number
     * @param {PIXI.Graphics} bar   The Bar container
     * @param {Object} data         Resource data for this bar
     * @private
     */
    _drawBar(number, bar, data) {
      const val = Number(data.value);
      const pct = Math.clamped(val, 0, data.max) / data.max;
      let h = Math.max((canvas.dimensions.size / 12), 8);
      if ( this.data.height >= 2 ) h *= 1.6;  // Enlarge the bar for large tokens
  
      // Draw the bar
      let color = (number === 0) ? [(1-(pct/2)), pct, 0] : [(0.5 * pct), (0.7 * pct), 0.5 + (pct / 2)];
      bar.clear()
         .beginFill(0x000000, 0.5)
         .lineStyle(2, 0x000000, 0.9)
         .drawRoundedRect(0, 0, this.w, h, 3)
         .beginFill(PIXI.utils.rgb2hex(color), 0.8)
         .lineStyle(1, 0x000000, 0.8)
         .drawRoundedRect(1, 1, pct*(this.w-2), h-2, 2);
  
      // Set position
      let posY = number === 0 ? this.h - h : 0;
      bar.position.set(0, posY);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw the token's nameplate as a text object
     * @return {PIXI.Text}  The Text object for the Token nameplate
     */
    _drawNameplate() {
  
      // Gate font size based on grid size
      const gs = canvas.dimensions.size;
      let h = 24;
      if ( gs >= 200 ) h = 36;
      else if ( gs <= 70 ) h = 20;
  
      // Create the nameplate text
      const name = new PIXI.Text(this.data.name, CONFIG.canvasTextStyle.clone());
      const textHeight = 42; // This is a magic number which PIXI renders at font size 36
  
      // Anchor to the top-center of the nameplate
      name.anchor.set(0.5, 0);
  
      // Adjust dimensions
      let bounds = name.getBounds();
      let ratio = bounds.width / bounds.height;
      const maxWidth = this.w * 2.5;
  
      // Wrap for multiple rows
      if ( (h * ratio) > maxWidth ) {
        name.style.wordWrap = true;
        name.style.wordWrapWidth = (textHeight / h) * maxWidth;
        bounds = name.getBounds();
        ratio = bounds.width / bounds.height;
      }
  
      // Downsize the name using the given scaling ratio
      const nrows = Math.ceil(bounds.height / textHeight);
      name.height = h * nrows;
      name.width = h * nrows * ratio;
  
      // Set position at bottom of token
      let ox = gs / 24;
      name.position.set(this.w / 2, this.h + ox);
      return name;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw a text tooltip for the token which can be used to display Elevation or a resource value
     */
    drawTooltip() {
      this.tooltip.removeChildren().forEach(c => c.destroy());
  
      // Get the Tooltip text
      let tip = this._getTooltipText();
      if (!tip.length) return;
  
      // Create the tooltip text, anchored to the center of the container
      const text = this.tooltip.addChild(new PIXI.Text(tip, CONFIG.canvasTextStyle));
      text.anchor.set(0.5, 0.5);
  
      // Adjust dimensions based on grid size
      let h = 20;
      if (canvas.dimensions.size >= 200) h = 24;
      else if (canvas.dimensions.size < 50) h = 16;
      let bounds = text.getLocalBounds(),
        r = (bounds.width / bounds.height);
      text.height = h;
      text.width = h * r;
  
      // Add the tooltip at the top of the parent Token container
      this.tooltip.position.set(this.w / 2, -0.5 * h);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Return the text which should be displayed in a token's tooltip field
     * @return {string}
     * @private
     */
    _getTooltipText() {
      let el = this.data.elevation;
      if (!Number.isFinite(el) || el === 0) return "";
      let units = canvas.scene.data.gridUnits;
      return el > 0 ? `+${el} ${units}` : `${el} ${units}`;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Draw the active effects and overlay effect icons which are present upon the Token
     */
    async drawEffects() {
      this.effects.removeChildren().forEach(c => c.destroy());
  
      // Draw status effects
      if (this.data.effects.length > 0 ) {
  
        // Determine the grid sizing for each effect icon
        let w = Math.round(canvas.dimensions.size / 2 / 5) * 2;
  
        // Draw a background Graphics object
        let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
  
        // Draw each effect icon
        for ( let [i, src] of this.data.effects.entries() ) {
          let tex = await loadTexture(src);
          let icon = this.effects.addChild(new PIXI.Sprite(tex));
          icon.width = icon.height = w;
          icon.x = Math.floor(i / 5) * w;
          icon.y = (i % 5) * w;
          bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
          this.effects.addChild(icon);
        }
      }
  
      // Draw overlay effect
      if ( this.data.overlayEffect ) {
        let tex = await loadTexture(this.data.overlayEffect);
        let icon = new PIXI.Sprite(tex),
            size = Math.min(this.w * 0.6, this.h * 0.6);
        icon.width = icon.height = size;
        icon.position.set((this.w - size) / 2, (this.h - size) / 2);
        icon.alpha = 0.80;
        this.effects.addChild(icon);
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Helper method to determine whether a token attribute is viewable under a certain mode
     * @param {number} mode   The mode from CONST.TOKEN_DISPLAY_MODES
     * @return {boolean}      Is the attribute viewable?
     * @private
     */
    _canViewMode(mode) {
      if ( mode === CONST.TOKEN_DISPLAY_MODES.NONE ) return false;
      else if ( mode === CONST.TOKEN_DISPLAY_MODES.ALWAYS ) return true;
      else if ( mode === CONST.TOKEN_DISPLAY_MODES.CONTROL ) return this._controlled;
      else if ( mode === CONST.TOKEN_DISPLAY_MODES.HOVER ) return this._hover;
      else if ( mode === CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER ) return this.owner && this._hover;
      else if ( mode === CONST.TOKEN_DISPLAY_MODES.OWNER ) return this.owner;
      return false;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Animate Token movement along a certain path which is defined by a Ray object
     * @param {Ray} ray   The path along which to animate Token movement
     */
    async animateMovement(ray) {
  
      // Move distance is 10 spaces per second
      const s = canvas.dimensions.size;
      this._movement = ray;
      const speed = s * 10;
      const duration = (ray.distance * 1000) / speed;
      let {x, y} = this.data;
  
      // Define attributes
      const attributes = [
        { parent: this, attribute: 'x', to: ray.B.x },
        { parent: this, attribute: 'y', to: ray.B.y }
      ];
  
      // Determine whether to animate vision reveal
      const dist = Math.max(Math.abs(this._movement.dx), Math.abs(this._movement.dy));
      let av = game.settings.get("core", "visionAnimation");
      let animateVision = av && ((this._controlled  && this.hasSight) || this.emitsLight) && (dist > s);
      const centers = new Set(canvas.grid.getCenter(this.x, this.y).join("_"));
  
      // Trigger the animation function
      let animationName = `Token.${this.id}.animateMovement`;
      await CanvasAnimation.animateLinear(attributes, {
        name: animationName,
        context: this,
        duration: duration,
        ontick: animateVision ? (dt, attr) => this._onMovementFrame(dt, attr, centers) : null
      });
  
      // Once movement is complete, update sight one final time
      this.data.x = x;
      this.data.y = y;
      canvas.sight.updateToken(this);
      canvas.lighting.drawLights();
      this._movement = null;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Animate the continual revealing of Token vision during a movement animation
     * @private
     */
    _onMovementFrame(dt, attributes, centers) {
      const pos = canvas.grid.getCenter(this.x, this.y).join("_");
      this.data.x = this.x;
      this.data.y = this.y;
      canvas.sight.updateToken(this, {defer: true});
      canvas.sight.update({noUpdateFog: centers.has(pos)});
      if ( this.lightSource ) this.lightSource.drawColor();
      centers.add(pos);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Terminate animation of this particular Token
     */
    stopAnimation() {
      return CanvasAnimation.terminateAnimation(`Token.${this.id}.animateMovement`);
    }
  
    /* -------------------------------------------- */
    /*  Methods
    /* -------------------------------------------- */
  
    /**
     * Check for collision when attempting a move to a new position
     * @param {Object} destination  An Object containing data for the attempted movement
     * @param {boolean} drag        Whether we are checking collision for a drag+drop movement
     *
     * @return {boolean}            A true/false indicator for whether the attempted movement caused a collision
     */
    checkCollision(destination) {
  
      // Create a Ray for the attempted move
      let origin = this.getCenter(...Object.values(this._validPosition));
      let ray = new Ray(duplicate(origin), duplicate(destination));
  
      // Shift the origin point by the prior velocity
      ray.A.x -= this._velocity.sx;
      ray.A.y -= this._velocity.sy;
  
      // Shift the destination point by the requested velocity
      ray.B.x -= Math.sign(ray.dx);
      ray.B.y -= Math.sign(ray.dy);
  
      // Check for a wall collision
      return canvas.walls.checkCollision(ray);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    clone() {
      const o = super.clone();
      o.actor = this.actor;
      return o;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onControl({releaseOthers=true, updateSight=true, pan=false} = {}) {
      _token = this;
      this.zIndex = 1;
      this.refresh();
      if ( updateSight ) canvas.sight.initializeTokens();
      if ( pan ) canvas.animatePan({x: this.x, y: this.y});
      canvas.sounds.update();
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onRelease({updateSight=true}={}) {
      super._onRelease({});
      this.zIndex = 0;
      if ( updateSight ) canvas.sight.initializeTokens();
      if ( game.user.isGM ) canvas.sounds.update();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Get the center-point coordinate for a given grid position
     * @param {number} x    The grid x-coordinate that represents the top-left of the Token
     * @param {number} y    The grid y-coordinate that represents the top-left of the Token
     * @return {Object}     The coordinate pair which represents the Token's center at position (x, y)
     */
    getCenter(x, y) {
      return {
        x: x + (this.w / 2),
        y: y + (this.h / 2)
      };
    }
  
    /* -------------------------------------------- */
  
    /**
     * Set the token's position by comparing its center position vs the nearest grid vertex
     * Return a Promise that resolves to the Token once the animation for the movement has been completed
     * @param {number} x            The x-coordinate of the token center
     * @param {number} y            The y-coordinate of the token center
     * @param {boolean} [animate]   Animate the movement path, default is true
     * @return {Promise}            The Token after animation has completed
     */
    async setPosition(x, y, {animate=true}={}) {
  
      // Create a Ray for the requested movement
      let origin = this._movement ? this.position : this._validPosition,
          target = {x: x, y: y},
          isVisible = this.isVisible;
  
      // Create the movement ray
      let ray = new Ray(origin, target);
  
      // Update the new valid position
      this._validPosition = target;
  
      // Record the Token's new velocity
      this._velocity = this._updateVelocity(ray);
  
      // Update visibility for a non-controlled token which may have moved into the controlled tokens FOV
      this.visible = isVisible;
  
      // Conceal the HUD if it targets this Token
      if ( this.hasActiveHUD ) this.layer.hud.clear();
  
      // Either animate movement to the destination position, or set it directly if animation is disabled
      if ( animate ) await this.animateMovement(new Ray(this.position, ray.B));
      else this.position.set(x, y);
  
      // If the movement took a controlled token off-screen, re-center the view
      if (this._controlled && isVisible) {
        let pad = 50;
        let gp = this.getGlobalPosition();
        if ((gp.x < pad) || (gp.x > window.innerWidth - pad) || (gp.y < pad) || (gp.y > window.innerHeight - pad)) {
          canvas.animatePan(this.center);
        }
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Update the Token velocity auto-regressively, shifting increasing weight towards more recent movement
     * Employ a magic constant chosen to minimize (effectively zero) the likelihood of trigonometric edge cases
     * @param {Ray} ray     The proposed movement ray
     * @return {Object}     An updated velocity with directional memory
     * @private
     */
    _updateVelocity(ray) {
      const v = this._velocity;
      const m = 0.89734721;
      return {
        dx: ray.dx,
        sx: ray.dx ? (m * Math.sign(ray.dx)) : (0.5 * m * Math.sign(v.sx)),
        dy: ray.dy,
        sy: ray.dy ? (m * Math.sign(ray.dy)) : (0.5 * m * Math.sign(v.sy))
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Set this Token as an active target for the current game User
     * @param {boolean} targeted        Is the Token now targeted?
     * @param {User|null} user          Assign the token as a target for a specific User
     * @param {boolean} releaseOthers   Release other active targets for the same player?
     * @param {boolean} groupSelection  Is this target being set as part of a group selection workflow?
     */
    setTarget(targeted=true, {user=null, releaseOthers=true, groupSelection=false}={}) {
      user = user || game.user;
  
      // Release other targets
      if ( user.targets.size && releaseOthers ) {
        user.targets.forEach(t => {
          if ( t !== this ) t.setTarget(false, {releaseOthers: false});
        });
        user.targets.clear();
      }
  
      // Acquire target
      if ( targeted ) {
        user.targets.add(this);
        this.targeted.add(user);
      }
  
      // Release target
      else {
        user.targets.delete(this);
        this.targeted.delete(user);
      }
  
      // Refresh Token display
      this.refresh();
  
      // Refresh the Token HUD
      if ( this.hasActiveHUD ) this.layer.hud.render();
  
      // Broadcast the target change
      if ( !groupSelection ) user.broadcastActivity({targets: user.targets.ids});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Add or remove the currently controlled Tokens from the active combat encounter
     * @param {Combat|null} combat    A Combat encounter from which to add or remove the Token
     * @return {Promise}
     */
    async toggleCombat(combat=null) {
  
      // Reference the combat encounter displayed in the Sidebar if none was provided
      combat = combat || ui.combat.combat;
      if ( !combat ) {
        if ( game.user.isGM ) {
          combat = await game.combats.object.create({scene: canvas.scene._id, active: true});
        }
        else return ui.notifications.warn(game.i18n.localize("COMBAT.NoneActive"));
      }
  
      // Determine whether we are adding to, or removing from combat based on the target token
      let inCombat = this.inCombat;
      const tokens = this._controlled ? canvas.tokens.controlled.filter(t => t.inCombat === inCombat) : [this];
  
      // Remove tokens from the Combat (GM Only)
      if ( inCombat ) {
        if ( !game.user.isGM ) return;
        const tokenIds = new Set(tokens.map(t => t.id));
        const combatantIds = combat.combatants.reduce((ids, c) => {
          if (tokenIds.has(c.tokenId)) ids.push(c._id);
          return ids;
        }, []);
        await combat.deleteEmbeddedEntity("Combatant", combatantIds);
      }
  
      // Add tokens to the Combat
      else {
        const createData = tokens.map(t => {return {tokenId: t.id, hidden: t.data.hidden}});
        await combat.createEmbeddedEntity("Combatant", createData);
      }
      return this;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Toggle an active effect by it's texture path.
     * Copy the existing Array in order to ensure the update method detects the data as changed.
     *
     * @param {string} texture      The texture file-path of the effect icon to toggle on the Token.
     * @return {Promise<boolean>}   Was the texture applied (true) or removed (false)
     */
    async toggleEffect(texture) {
      const fx = this.data.effects;
      let active = false;
      const idx = fx.findIndex(e => e === texture);
      if (idx === -1) {
        fx.push(texture);
        active = true;
      }
      else fx.splice(idx, 1);
      await this.update({effects: fx}, {diff: false});
      return active;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Set or remove the overlay texture for the Token by providing a new texture path
     * @param {string} texture      The texture file-path of the effect to set as the Token overlay icon
     * @return {Promise<boolean>}   Was the texture applied (true) or removed (false)
     */
    async toggleOverlay(texture) {
      let active = this.data.overlayEffect === texture;
      let effect = active ? null : texture;
      await this.update({overlayEffect: effect});
      return !active;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Toggle the visibility state of any Tokens in the currently selected set
     * @return {Promise}
     */
    async toggleVisibility() {
      let isHidden = this.data.hidden;
      const tokens = this._controlled ? canvas.tokens.controlled : [this];
      const updates = tokens.map(t => { return {_id: t.id, hidden: !isHidden}});
      return this.layer.updateMany(updates);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Return the token's sight origin, tailored for the direction of their movement velocity to break ties with walls
     * @return {Object}
     */
    getSightOrigin() {
      let p = this.center;
      return {
        x: p.x - this._velocity.sx,
        y: p.y - this._velocity.sy
      };
    }
  
    /* -------------------------------------------- */
  
    /**
     * A generic transformation to turn a certain number of grid units into a radius in canvas pixels.
     * This function adds additional padding to the light radius equal to half the token width.
     * This causes light to be measured from the outer token edge, rather than from the center-point.
     * @param units {Number}  The radius in grid units
     * @return {number}       The radius in canvas units
     */
    getLightRadius(units) {
      if (units === 0) return 0;
      const u = Math.abs(units);
      const hw = (this.w / 2);
      return (((u / canvas.dimensions.distance) * canvas.dimensions.size) + hw) * Math.sign(units);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Perform an incremental token movement, shifting the token's position by some number of grid units.
     * The offset parameters will move the token by that number of grid spaces in one or both directions.
     *
     * @param {number} dx         The number of grid units to shift along the X-axis
     * @param {number} dy         The number of grid units to shift along the Y-axis
     * @return {Promise}
     */
    async shiftPosition(dx, dy) {
      let moveData = this._getShiftedPosition(dx, dy);
      return this.update(moveData);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _getShiftedPosition(dx, dy) {
      let [x, y] = canvas.grid.grid.shiftPosition(this.data.x, this.data.y, dx, dy);
      let targetCenter = this.getCenter(x, y);
      let collide = this.checkCollision(targetCenter);
      return collide ? {x: this.data.x, y: this.data.y} : {x, y};
    }
  
    /* -------------------------------------------- */
  
    /**
     * Extend the PlaceableObject.rotate method to prevent rotation if the Token is in the midst of a movement animation
     */
    rotate(...args) {
      if ( this._movement ) return;
      super.rotate(...args);
    }
  
    /* -------------------------------------------- */
    /*  Socket Listeners and Handlers               */
    /* -------------------------------------------- */
  
    /** @override */
    _onCreate(options, userId) {
  
      // Initialize Tokens on the Sight Layer if the Token could be a vision source or emits light
      if ( (this.data.vision && this.observer) || this.emitsLight ) {
        canvas.addPendingOperation(`SightLayer.initializeTokens`, canvas.sight.initializeTokens, canvas.sight);
      }
  
      // Draw the object and display the new Token
      this.draw().then(token => {
        if ( !game.user.isGM && this.owner ) this.control({pan: true});
        this.visible = this.isVisible;
      });
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onUpdate(data, options, userId) {
      const keys = Object.keys(data);
      const changed = new Set(keys);
  
      // If Actor data link has changed, replace the Token actor
      if ( ["actorId", "actorLink"].some(c => changed.has(c))) this.actor = Actor.fromToken(this);
      if ( !this.data.actorLink && changed.has("actorData") ){
        this._onUpdateTokenActor(data.actorData);
      }
  
      // Handle direct Token updates
      const fullRedraw = ["img", "name", "width", "height", "tint"].some(r => changed.has(r));
      const visibilityChange = changed.has("hidden");
      const positionChange = ["x", "y"].some(c => changed.has(c));
      const perspectiveChange = changed.has("rotation") && this.hasLimitedVisionAngle;
      const visionChange = ["brightLight", "brightSight", "dimLight", "dimSight", "lightAlpha", "lightAngle",
        "lightColor", "sightAngle", "vision"].some(k => changed.has(k));
  
      // Change in Token appearance
      if ( fullRedraw ) {
        const visible = this.visible;
        this.draw();
        this.visible = visible;
      }
  
      // Non-full updates
      else {
        if ( positionChange ) this.setPosition(this.data.x, this.data.y, options);
        if ( ["effects", "overlayEffect"].some(k => changed.has(k)) ) this.drawEffects();
        if ( changed.has("elevation") ) this.drawTooltip();
        if ( keys.some(k => k.startsWith("bar")) ) this.drawBars();
        this.refresh();
      }
  
      // Changes to Token visibility trigger downstream impacts
      if ( visibilityChange ) {
        if ( !game.user.isGM ) {
          if ( this._controlled && data.hidden ) this.release();
          else if ( !data.hidden && !canvas.tokens.controlled.length ) this.control({pan: true});
        }
        this.visible = this.isVisible;
      }
  
      // Process perspective changes
      const updatePerspective = (visibilityChange || positionChange || perspectiveChange || visionChange) &&
        (this.data.vision || changed.has("vision") || this.emitsLight);
      if ( updatePerspective ) {
        const animating = positionChange && (options.animate !== false);
        if ( !animating ) {
          canvas.sight.updateToken(this, {defer: true});
          canvas.addPendingOperation("SightLayer.update", canvas.sight.update, canvas.sight);
        }
        canvas.addPendingOperation("LightingLayer.update", canvas.lighting.update, canvas.lighting);
        canvas.addPendingOperation(`SoundLayer.update`, canvas.sounds.update, canvas.sounds);
      }
  
      // Process Combat Tracker changes
      if ( this.inCombat ) {
        if ( changed.has("name") ) {
          canvas.addPendingOperation(`Combat.setupTurns`, game.combat.setupTurns, game.combat);
        }
        if ( ["effects", "name"].some(k => changed.has(k)) ) {
          canvas.addPendingOperation(`CombatTracker.render`, ui.combat.render, ui.combat);
        }
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onDelete(options, userId) {
  
      // Cancel movement animations
      this.stopAnimation();
  
      // Remove target (if applicable)
      game.user.targets.delete(this);
  
      // Process changes to perception
      if ( this.emitsLight || ( this.observer && this.data.vision ) ) {
        canvas.sight.updateToken(this, {deleted: true});
        canvas.lighting.update();
      }
  
        // Remove audible sound
      if ( this.observer ) {
        canvas.addPendingOperation(`SoundsLayer.initialize`, canvas.sounds.initialize, canvas.sounds);
      }
  
      // Remove Combatants
      if ( userId === game.user.id ) {
        game.combats._onDeleteToken(this.scene.id, this.id);
      }
  
      // Parent class deletion handlers
      return super._onDelete(options, userId);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle updates to the Token's referenced Actor (either Entity or synthetic)
     * @param {Object} updateData     The changes to Token actorData overrides which are incremental
     * @private
     */
    _onUpdateTokenActor(updateData) {
  
      // Reject any calls which were incorrectly placed to this method for tokens which are linked
      if ( !this.actor || this.data.actorLink ) return;
  
      // Update data for the synthetic Token
      mergeObject(this.actor._data, updateData);
      this.actor._onUpdate(updateData);
  
      // Update Token bar attributes
      this._onUpdateBarAttributes(updateData);
  
      // Update tracked Combat resources
      if ( this.inCombat && updateData.data && hasProperty(updateData.data, game.combats.settings.resource) ) {
        canvas.addPendingOperation(`CombatTracker.updateTrackedResources`, ui.combat.updateTrackedResources, ui.combat);
        canvas.addPendingOperation(`CombatTracker.render`, ui.combat.render, ui.combat);
      }
  
      // Render the active Token sheet
      this.actor.sheet.render();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle updates to this Token which originate from changes to the base Actor entity
     * @param {Object} actorData     Updated data for the base Actor
     * @param {Object} updateData    Changes to the base Actor which were incremental
     * @private
     */
    _onUpdateBaseActor(actorData, updateData) {
      if ( !this.actor ) return;
  
      // For Tokens which are unlinked, update the synthetic Actor
      if ( !this.data.actorLink ) {
        this.actor._data = mergeObject(actorData, this.data.actorData, {inplace: false});
        this.actor.prepareData();
      }
  
      // Update Token bar attributes
      this._onUpdateBarAttributes(updateData);
  
      // Update tracked Combat resources
      if ( this.inCombat && updateData.data && hasProperty(updateData.data, game.combats.settings.resource) ) {
        ui.combat.updateTrackedResources();
        ui.combat.render();
      }
  
      // Render the active Token sheet
      this.actor.sheet.render();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle the possible re-drawing of Token attribute bars depending on whether the tracked attribute changed
     * @param {Object} updateData     An object of changed data
     * @private
     */
    _onUpdateBarAttributes(updateData) {
      const update = ["bar1", "bar2"].some(b => {
        let bar = this.data[b];
        return bar.attribute && hasProperty(updateData, "data."+bar.attribute);
      });
      if ( update ) this.drawBars();
    }
  
    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */
  
    /** @override */
    _canControl(user, event) {
      if ( canvas.controls.ruler.active ) return false;
      const tool = game.activeTool;
      if ( tool === "target" ) return true;
      return game.user.isGM || (this.actor && this.actor.hasPerm(user, "OWNER"));
    }
  
    /** @override */
    _canHUD(user, event) {
      if ( canvas.controls.ruler.active ) return false;
      return user.isGM || (this.actor && this.actor.hasPerm(user, "OWNER"));
    }
  
    /** @override */
    _canConfigure(user, event) {
      return true;
    }
  
    /** @override */
    _canHover(user, event) {
      return true;
    }
  
    /** @override */
    _canView(user, event) {
      return this.actor && this.actor.hasPerm(user, "LIMITED");
    }
  
    /** @override */
    _canDrag(user, event) {
      if ( !this._controlled ) return false;
      const tool = game.activeTool;
      if (( tool !== "select" ) || game.keyboard.isCtrl(event) ) return false;
      const blockMove = game.paused && !game.user.isGM;
      return !this._movement && !blockMove;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onHoverIn(event, options) {
      if ( this.inCombat ) {
        $(`li.combatant[data-token-id="${this.id}"]`).addClass("hover");
      }
      return super._onHoverIn(event, options);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onHoverOut(event) {
      if ( this.inCombat ) {
        $(`li.combatant[data-token-id="${this.id}"]`).removeClass("hover");
      }
      return super._onHoverOut(event);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onClickLeft(event) {
      const tool = game.activeTool;
      const oe = event.data.originalEvent;
  
      // Dispatch Ruler measurements through to the Canvas
      let isRuler = (tool === "ruler") || ( oe.ctrlKey || oe.metaKey );
      if ( isRuler ) return canvas.mouseInteractionManager._handleClickLeft(event);
  
      // Add or remove targets
      if ( tool === "target" ) {
        this.setTarget(!this.isTargeted, {releaseOthers: !oe.shiftKey});
      }
  
      // Add or remove control
      else super._onClickLeft(event);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onClickLeft2(event) {
      const sheet = this.actor.sheet;
      sheet.render(true, {token: this});
      sheet.maximize();
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onClickRight2(event) {
      if ( this.owner ) {
        if ( game.user.can("TOKEN_CONFIGURE") ) return super._onClickRight2(event);
      }
      else return this.setTarget(!this.targeted.has(game.user), {releaseOthers: !event.data.originalEvent.shiftKey});
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _onDragLeftDrop(event) {
      const clones = event.data.clones || [];
      const {originalEvent, destination} = event.data;
  
      // Ensure the destination is within bounds
      if ( !canvas.grid.hitArea.contains(destination.x, destination.y) ) return false;
  
      // Compute the final dropped positions
      const updates = clones.reduce((updates, c) => {
  
        // Get the snapped top-left coordinate
        let dest = {x: c.data.x, y: c.data.y};
        if (!originalEvent.shiftKey) {
          const precision = (c.data.width < 1) || (c.data.height < 1) ? 2 : 1;
          dest = canvas.grid.getSnappedPosition(dest.x, dest.y, precision);
        }
  
        // Test collision for each moved token vs the central point of it's destination space
        if ( !game.user.isGM ) {
          c._velocity = c._original._velocity;
          let target = c.getCenter(dest.x, dest.y);
          let collides = c.checkCollision(target);
          if ( collides ) {
            ui.notifications.error(game.i18n.localize("ERROR.TokenCollide"));
            return updates
          }
        }
  
        // Perform updates where no collision occurs
        updates.push({_id: c._original.id, x: dest.x, y: dest.y});
        return updates;
      }, []);
      return canvas.scene.updateEmbeddedEntity(this.constructor.name, updates);
    }
  }