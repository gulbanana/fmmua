class Scene extends Entity {
    constructor(...args) {
      super(...args);
  
      /**
       * Track whether the scene is the active view
       * @type {boolean}
       */
      this._view = this.data.active;
  
      /**
       * Track the viewed position of each scene (while in memory only, not persisted)
       * When switching back to a previously viewed scene, we can automatically pan to the previous position.
       * Object with keys: x, y, scale
       * @type {Object}
       */
      this._viewPosition = {};
    }
  
    /* -------------------------------------------- */
  
    /** @extends {EntityCollection.config} */
    static get config() {
      return {
        baseEntity: Scene,
        collection: game.scenes,
        embeddedEntities: {
          "AmbientLight": "lights",
          "AmbientSound": "sounds",
          "Drawing": "drawings",
          "Note": "notes",
          "MeasuredTemplate": "templates",
          "Tile": "tiles",
          "Token": "tokens",
          "Wall": "walls"
        },
        label: "ENTITY.Scene"
      };
    }
  
      /* -------------------------------------------- */
  
    /** @override */
      prepareEmbeddedEntities() {}
  
      /* -------------------------------------------- */
    /*  Properties                                  */
      /* -------------------------------------------- */
  
    /**
     * A convenience accessor for the background image of the Scene
     * @type {string}
     */
      get img() {
        return this.data.img;
    }
  
      /* -------------------------------------------- */
  
    /**
     * A convenience accessor for whether the Scene is currently active
     * @type {boolean}
     */
    get active() {
        return this.data.active;
    }
  
      /* -------------------------------------------- */
  
    /**
     * A convenience accessor for whether the Scene is currently viewed
     * @type {boolean}
     */
    get isView() {
        return this._view;
    }
  
      /* -------------------------------------------- */
  
    /**
     * A reference to the JournalEntry entity associated with this Scene, or null
     * @return {JournalEntry|null}
     */
    get journal() {
      return this.data.journal ? game.journal.get(this.data.journal) : null;
    }
  
      /* -------------------------------------------- */
  
    /**
     * A reference to the Playlist entity for this Scene, or null
     * @type {Playlist|null}
     */
    get playlist() {
      return this.data.playlist ? game.playlists.get(this.data.playlist) : null;
    }
  
      /* -------------------------------------------- */
  
    /**
     * Set this scene as the current view
     */
      async view() {
  
        // Do not switch if the loader is still running
      if ( canvas.loading ) {
        return ui.notifications.warn(`You cannot switch Scenes until resources finish loading for your current view.`);
      }
  
      // Switch the viewed scene
      this.collection.entities.forEach(scene => {
        scene._view = scene._id === this._id;
      });
  
      // Re-draw the canvas if the view is different
      if ( canvas.id !== this._id ) {
        console.log(`Foundry VTT | Viewing Scene ${this.name}`);
        await canvas.draw();
      }
  
      // Render apps for the collection
      this.collection.render();
      ui.combat.initialize();
    }
  
      /* -------------------------------------------- */
  
    /**
     * Set this scene as currently active
     * @return {Promise}  A Promise which resolves to the current scene once it has been successfully activated
     */
      async activate() {
        if ( this.active ) return this;
        return this.update({active: true});
    }
  
      /* -------------------------------------------- */
      /*  Socket Listeners and Handlers               */
      /* -------------------------------------------- */
  
    /** @override */
    async clone(createData={}, options={}) {
      createData["active"] = false;
      createData["navigation"] = false;
      return super.clone(createData, options);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
      async update(data, options={}) {
      const imgChange = !!data.img && (data.img !== this.data.img);
      const needsThumb = !!(this.data.img || data.img) && !this.data.thumb;
      const hasDims = !!data.width && !!data.height;
  
        // Update the Scene thumbnail if necessary
      if ( imgChange || needsThumb || !hasDims ) {
        try {
          const thumbData = await BackgroundLayer.createThumbnail(data.img || this.data.img);
          data.thumb = thumbData?.thumb || null;
          if ( thumbData && !hasDims ) {
            data.width = thumbData.width;
            data.height = thumbData.height;
          }
        }
        catch(err) {
          ui.notifications.error("Thumbnail generation for Scene failed: " + err.message);
          data["thumb"] = null;
        }
      }
  
      // Warn the user if Scene dimensions are changing
      if ( options["fromSheet"] === true ) {
        const delta = diffObject(this.data, data);
        const changed = Object.keys(delta);
        if ( ["width", "height", "padding", "shiftX", "shiftY", "size"].some(k => changed.includes(k)) ) {
          const confirm = await Dialog.confirm({
            title: game.i18n.localize("SCENES.DimensionChangeTitle"),
            content: `<p>${game.i18n.localize("SCENES.DimensionChangeWarning")}</p>`
          });
          if ( !confirm ) return;
        }
        delete options["fromSheet"];
      }
  
      // Call the Entity update
      return super.update(data, options);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onCreate(data, ...args) {
      super._onCreate(data, ...args);
      if ( data.active === true ) this._onActivate(true);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onUpdate(data, options, userId, context) {
      super._onUpdate(data, options, userId, context);
  
      // Get the changed attributes
      let changed = new Set(Object.keys(data).filter(k => k !== "_id"));
  
      // If the Scene became active, go through the full activation procedure
      if ( changed.has("active") ) this._onActivate(data.active);
  
      // If the Thumbnail was updated, bust the image cache
      if ( changed.has("thumb") && this.data.thumb ) {
        this.data.thumb = this.data.thumb.split("?")[0] + `?${Date.now()}`;
      }
  
      // If the scene is already active, maybe re-draw the canvas
      if ( canvas.scene === this ) {
        const redraw = [
          "backgroundColor", "drawings", "gridType", "grid", "gridAlpha", "gridColor", "gridDistance", "gridUnits",
          "shiftX", "shiftY", "width", "height", "img", "padding", "tokenVision", "fogExploration",
          "lights", "sounds", "templates", "tiles", "tokens", "walls", "weather"
        ];
        if ( redraw.some(k => changed.has(k)) ) return canvas.draw();
  
        // Modify global illumination
        if ( changed.has("globalLight") ) canvas.sight.initializeTokens();
  
        // Progress darkness level
        if ( changed.has("darkness") ) {
          canvas.sight.initializeLights();
          if ( options.animateDarkness ) canvas.lighting.animateDarkness(data.darkness);
          else canvas.lighting.update(data.darkness);
        }
      }
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onDelete(...args) {
      super._onDelete(...args);
      if ( canvas.scene._id === this._id ) canvas.draw(null);
    }
  
      /* -------------------------------------------- */
  
    /**
     * Handle Scene activation workflow if the active state is changed to true
     * @private
     */
    _onActivate(active) {
      const collection = this.collection;
      if ( active ) {
        collection.entities.forEach(scene => scene.data.active = scene._id === this._id);
        return this.view();
      }
      else canvas.draw(null);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onCreateEmbeddedEntity(embeddedName, child, options, userId) {
      if ( !canvas.ready || !this.isView ) return;
      const layer = canvas.getLayerByEmbeddedName(embeddedName);
      const object = layer.createObject(child);
      object._onCreate(options, userId);
      if ( options.renderSheet && object.sheet ) object.sheet.render(true);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onUpdateEmbeddedEntity(embeddedName, child, updateData, options, userId) {
      if ( !canvas.ready || !this.isView ) return;
      const layer = canvas.getLayerByEmbeddedName(embeddedName);
      const object = layer.get(child._id);
      object.data = this.getEmbeddedEntity(embeddedName, child._id);
      object._onUpdate(updateData, options, userId);
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onDeleteEmbeddedEntity(embeddedName, child, options, userId) {
      if ( !canvas.ready || !this.isView ) return;
      const layer = canvas.getLayerByEmbeddedName(embeddedName);
      const object = layer.get(child._id);
      layer.objects.removeChild(object);
      object._onDelete(options, userId);
      object.destroy({children: true});
    }
  
      /* -------------------------------------------- */
  
    /** @override */
    _onModifyEmbeddedEntity(...args) {
      if ( canvas.ready ) canvas.triggerPendingOperations();
    }
  
    /* -------------------------------------------- */
    /*  History Storage Handlers                    */
    /* -------------------------------------------- */
  
    /** @override */
    static _handleCreateEmbeddedEntity({request, result=[], userId}={}) {
      const { type, parentId, options } = request;
      if ( canvas.ready && !options.isUndo && (canvas.scene._id === parentId) ) {
        const layer = canvas.getLayerByEmbeddedName(type);
        layer.storeHistory("create", result);
      }
      return super._handleCreateEmbeddedEntity({request, result, userId});
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    static _handleUpdateEmbeddedEntity({request, result=[], userId}={}) {
      const { type, parentId, options } = request;
      if ( canvas.ready && !options.isUndo && (canvas.scene._id === parentId) ) {
        const layer = canvas.getLayerByEmbeddedName(type);
        const scene = this.collection.get(parentId);
        const updatedIds = new Set(result.map(r => r._id));
        const originals = duplicate(scene.getEmbeddedCollection(type)).filter(o => updatedIds.has(o._id));
        layer.storeHistory("update", originals);
      }
      return super._handleUpdateEmbeddedEntity({request, result, userId});
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    static _handleDeleteEmbeddedEntity({request, result=[], userId}={}) {
      const { type, parentId, options } = request;
      if ( canvas.ready && !options.isUndo && (canvas.scene._id === parentId) ) {
        const layer = canvas.getLayerByEmbeddedName(type);
        const scene = this.collection.get(parentId);
        const originals = scene.getEmbeddedCollection(type).filter(o => result.includes(o._id));
        layer.storeHistory("delete", originals);
      }
      return super._handleDeleteEmbeddedEntity({request, result, userId});
    }
  
    /* -------------------------------------------- */
    /*  Importing and Exporting                     */
    /* -------------------------------------------- */
  
    /** @override */
    async toCompendium() {
      const data = await super.toCompendium();
      data.active = false;
      data.navigation = false;
      data.navOrder = null;
      data.fogReset = null;
      if ( data.img ) {
        const t = await BackgroundLayer.createThumbnail(data.img);
        data.thumb = t.thumb;
      }
      return data;
    }
  }