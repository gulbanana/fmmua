// not in foundry-pc-types; impl-copy

/**
 * The Chat Log application displayed in the Sidebar
 * @extends {SidebarTab}
 * @see {Sidebar}
 */
class ChatLog extends SidebarTab {
    constructor(options) {
      super(options);
  
      /**
       * Track the history of the past 5 sent messages which can be accessed using the arrow keys
       * @type {object[]}
       * @private
       */
      this._sentMessages = [];
  
      /**
       * Track which remembered message is being currently displayed to cycle properly
       * @type {number}
       * @private
       */
      this._sentMessageIndex = -1;
  
      /**
       * Track the time when the last message was sent to avoid flooding notifications
       * @type {number}
       * @private
       */
      this._lastMessageTime = 0;
  
      /**
       * Track the id of the last message displayed in the log
       * @type {string|null}
       * @private
       */
      this._lastId = null;
  
      /**
       * Track the last received message which included the user as a whisper recipient.
       * @type {ChatMessage|null}
       * @private
       */
      this._lastWhisper = null;
  
      // Update timestamps every 15 seconds
      setInterval(this.updateTimestamps, 1000 * 15);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "chat",
        template: "templates/sidebar/chat-log.html",
        title: game.i18n.localize("CHAT.Title"),
        scrollContainer: null,
        stream: false
      });
    }
  
    /* -------------------------------------------- */
  
    /**
     * A reference to the Messages collection that the chat log displays
     * @type {Messages}
     */
    get collection() {
      return game.messages;
    }
  
    /* -------------------------------------------- */
    /*  Application Rendering                       */
    /* -------------------------------------------- */
  
    /** @override */
    getData(options) {
      return {
        user: game.user,
        rollMode: game.settings.get("core", "rollMode"),
        rollModes: CONFIG.Dice.rollModes,
        isStream: !!this.options.stream
      };
    }
  
    /* -------------------------------------------- */
  
    /** @override */
      async _render(...args) {
      if (this.rendered) return; // Never re-render the Chat Log itself, only it's contents
      await super._render(...args);
      await this._renderBatch(CONFIG.ChatMessage.batchSize);
      this.scrollBottom();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Render a batch of additional messages, prepending them to the top of the log
     * @param {number} size     The batch size to include
     * @return {Promise}
     * @private
     */
    async _renderBatch(size) {
      if ( !this.rendered ) return;
      this._state = Application.RENDER_STATES.RENDERING;
      const messages = game.messages.entities;
      const log = this.element.find("#chat-log");
  
      // Get the index of the last rendered message
      let lastIdx = messages.findIndex(m => m._id === this._lastId);
      lastIdx = lastIdx !== -1 ? lastIdx : messages.length;
  
      // Get the next batch to render
      let targetIdx = Math.max(lastIdx - size,  0);
      let m = null;
      if ( lastIdx !== 0 ) {
        let html = [];
        for ( let i=targetIdx; i<lastIdx; i++) {
          m = messages[i];
          if (!m.visible) continue;
          try {
            html.push(await m.render());
          } catch (err) {
            console.error(`Chat message ${m.id} failed to render.\n${err})`);
          }
        }
  
        // Prepend the HTML
        log.prepend(html);
        this._lastId = messages[targetIdx].id;
      }
  
      // Restore the rendered state
      this._state = Application.RENDER_STATES.RENDERED;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    renderPopout(original) {
      throw new Error("The Chat Log does not support pop-out mode");
    }
  
    /* -------------------------------------------- */
    /*  Chat Sidebar Methods                        */
    /* -------------------------------------------- */
  
    /**
     * Delete all message HTML from the log
     */
    deleteAll() {
      $("#chat-log").children().each(function() {
        $(this).slideUp();
      }, () => log.html(""));
    }
  
    /* -------------------------------------------- */
  
    /**
     * Delete a single message from the chat log
     * @param {string} messageId    The ChatMessage entity to remove from the log
     * @param {boolean} [deleteAll] Is this part of a flush operation to delete all messages?
     */
    deleteMessage(messageId, {deleteAll=false}={}) {
      let li = this.element.find(`.message[data-message-id="${messageId}"]`);
  
      // Update the last index
      if ( deleteAll ) {
        this._lastId = null;
      } else if ( messageId === this._lastId ) {
        const next = li[0].nextElementSibling;
        this._lastId = !!next ? next.dataset.messageId : null;
      }
  
      // Remove the deleted message
      if ( li.length ) li.slideUp(100, () => li.remove());
    }
  
    /* -------------------------------------------- */
  
    /**
     * Trigger a notification that alerts the user visually and audibly that a new chat log message has been posted
     */
    notify(message) {
      this._lastMessageTime = new Date();
      if ( !this.rendered ) return;
  
      // Display the chat notification icon and remove it 3 seconds later
      let icon = $('#chat-notification');
      if ( icon.is(":hidden") ) icon.fadeIn(100);
      setTimeout(() => {
        if ( new Date() - this._lastMessageTime > 3000 && icon.is(":visible") ) icon.fadeOut(100);
      }, 3001);
  
      // Play a notification sound effect
      if ( message.data.sound ) AudioHelper.play({src: message.data.sound});
    }
  
    /* -------------------------------------------- */
  
    /**
     * Parse a chat string to identify the chat command (if any) which was used
     * @param {string} message    The message to match
     * @return {string[]}         The identified command and regex match
     */
    static parse(message) {
  
      // Dice roll regex
      let formula = '([^#]*)';                  // Capture any string not starting with '#'
      formula += '(?:(?:#\\s?)(.*))?';          // Capture any remaining flavor text
      const roll = '^(\\/r(?:oll)? )';          // Regular rolls, support /r or /roll
      const gm = '^(\\/gmr(?:oll)? )';          // GM rolls, support /gmr or /gmroll
      const br = '^(\\/b(?:lind)?r(?:oll)? )';  // Blind rolls, support /br or /blindroll
      const sr = '^(\\/s(?:elf)?r(?:oll)? )';   // Self rolls, support /sr or /sroll
      const any = '([^]*)';                     // Any character, including new lines
  
      // Define regex patterns
      const patterns = {
        "roll": new RegExp(roll+formula, 'i'),
        "gmroll": new RegExp(gm+formula, 'i'),
        "blindroll": new RegExp(br+formula, 'i'),
        "selfroll": new RegExp(sr+formula, 'i'),
        "ic": new RegExp('^(\/ic )'+any, 'i'),
        "ooc": new RegExp('^(\/ooc )'+any, 'i'),
        "emote": new RegExp('^(\/(?:em(?:ote)?|me) )'+any, 'i'),
        "whisper": new RegExp(/^(\/w(?:hisper)?\s{1})(\[(?:[^\]]+)\]|(?:[^\s]+))\s+([^]*)/, 'i'),
        "reply": new RegExp('^(\/reply )'+any, 'i'),
        "gm": new RegExp('^(\/gm )'+any, 'i'),
        'players': new RegExp('^(\/players )'+any, 'i'),
        "invalid": /^(\/[^\s]+)/, // Any other message starting with a slash command is invalid
      };
  
      // Iterate over patterns, finding the first match
      let c, rgx, match;
      for ( [c, rgx] of Object.entries(patterns) ) {
        match = message.match(rgx); 
        if ( match ) return [c, match];
      }
      return ["none", [message, "", message]];
    }
  
    /* -------------------------------------------- */
  
    /**
     * Post a single chat message to the log
     * @param {ChatMessage} message   A ChatMessage entity instance to post to the log
     * @param {boolean} [notify]      Trigger a notification which shows the log as having a new unread message
     * @return {Promise}              A Promise which resolves once the message is posted
     */
    async postOne(message, notify=false) {
      if ( !message.visible ) return;
  
      // Track internal flags
      if ( !this._lastId ) this._lastId = message.id; // Ensure that new messages don't result in batched scrolling
      if ( (message.data.whisper || []).includes(game.user.id) && !message.isRoll ) {
        this._lastWhisper = message;
      }
  
      // Render the message to the log
      return message.render().then(html => {
        this.element.find("#chat-log").append(html);
        this.scrollBottom();
        if ( notify ) this.notify(message);
      });
    }
  
    /* -------------------------------------------- */
  
    /**
     * Scroll the chat log to the bottom
     * @private
     */
    scrollBottom() {
      const el = this.element;
      const log = el.length ? el[0].querySelector("#chat-log") : null;
      if ( log ) log.scrollTop = log.scrollHeight;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Update the content of a previously posted message after its data has been replaced
     * @param {ChatMessage} message   The ChatMessage instance to update
     * @param {boolean} notify        Trigger a notification which shows the log as having a new unread message
     */
    updateMessage(message, notify=false) {
      let li = this.element.find(`.message[data-message-id="${message.id}"]`);
      if ( li.length ) message.render().then(html => li.replaceWith(html));
      else this.postOne(message, false);
      if ( notify ) this.notify(message);
    }
  
    /* -------------------------------------------- */
  
    updateTimestamps() {
      let stamps = game.messages.entities.reduce((acc, val) => { acc[val._id] = val.data.timestamp; return acc;}, {});
      $("#chat-log").children().each((i, li) => {
        let id = li.getAttribute("data-message-id"),
            stamp = stamps[id];
        if ( !stamp ) return;
        li.querySelector('.message-timestamp').textContent = timeSince(stamp);
      })
    }
  
    /* -------------------------------------------- */
    /*  Event Listeners and Handlers
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners triggered within the ChatLog application
     * @param html {jQuery|HTMLElement}
     */
    activateListeners(html) {
  
      // Load new messages on scroll
      html.find("#chat-log").scroll(this._onScrollLog.bind(this));
  
      // Chat message entry
      html.find("#chat-message").keydown(this._onChatKeyDown.bind(this));
  
      // Expand dice roll tooltips
      html.on("click", ".dice-roll", this._onDiceRollClick.bind(this));
  
      // Modify Roll Type
      html.find('select[name="rollMode"]').change(this._onChangeRollMode.bind(this));
  
      // Single Message Delete
      html.on('click', 'a.message-delete', this._onDeleteMessage.bind(this));
  
      // Flush log
      html.find('a.chat-flush').click(this._onFlushLog.bind(this));
  
      // Export log
      html.find('a.export-log').click(this._onExportLog.bind(this));
  
      // Chat Entry context menu
      this._contextMenu(html);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Prepare the data object of chat message data depending on the type of message being posted
     * @param {string} message      The original string of the message content
     * @return {Promise.<Object>}   A Promise resolving to the prepared chat data object
     * @private
     */
    async processMessage(message) {
      const cls = CONFIG.ChatMessage.entityClass;
  
      // Set up basic chat data
      const chatData = {
        user: game.user._id,
        speaker: cls.getSpeaker()
      };
  
      // Allow for handling of the entered message to be intercepted by a hook
      if ( Hooks.call("chatMessage", this, message, chatData) === false ) return;
  
      // Alter the message content, if needed
      message = message.replace(/\n/g, "<br>");
  
      // Parse the message to determine the matching handler
      let [command, match] = this.constructor.parse(message);
  
      // Special handlers for no command
      if ( command === "invalid" ) throw new Error(game.i18n.format("CHAT.InvalidCommand", {command: match[1]}));
      else if ( command === "none" ) command = chatData.speaker.token ? "ic" : "ooc";
  
      // Process message data based on the identified command type
      const createOptions = {};
      switch (command) {
        case "roll": case "gmroll": case "blindroll": case "selfroll":
          this._processDiceCommand(command, match, chatData, createOptions);
          break;
        case "whisper": case "reply": case "gm": case "players":
          this._processWhisperCommand(command, match, chatData, createOptions);
          break;
        case "ic": case "emote": case "ooc":
          this._processChatCommand(command, match, chatData, createOptions);
          break;
      }
  
      // Create the message using provided data and options
      return cls.create(chatData, createOptions);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Process messages which are posted using a dice-roll command
     * @param {string} command          The chat command type
     * @param {RegExpMatchArray} match  The matched RegExp expressions
     * @param {Object} chatData         The initial chat data
     * @param {Object} createOptions    Options used to create the message
     * @private
     */
    _processDiceCommand(command, match, chatData, createOptions) {
  
      // Roll content and flavor text
      let [formula, flavor] = match.slice(2, 4);
      mergeObject(chatData, {
        content: formula,
        flavor: flavor || null,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
      });
  
      // Convert the chat content into a Roll
      const actor = ChatMessage.getSpeakerActor(chatData.speaker) || game.user.character;
      const rollData = actor ? actor.getRollData() : {};
      chatData.roll = Roll.create(formula, rollData).evaluate();
  
      // Record additional roll data
      chatData.sound = CONFIG.sounds.dice;
      if ( ["gmroll", "blindroll"].includes(command) ) chatData.whisper = ChatMessage.getWhisperRecipients("GM");
      if ( command === "selfroll" ) chatData.whisper = [game.user._id];
      if ( command === "blindroll" ) chatData.blind = true;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Process messages which are posted using a chat whisper command
     * @param {string} command          The chat command type
     * @param {RegExpMatchArray} match  The matched RegExp expressions
     * @param {Object} chatData         The initial chat data
     * @param {Object} createOptions    Options used to create the message
     * @private
     */
    _processWhisperCommand(command, match, chatData, createOptions) {
  
      // Prepare whisper data
      chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
      delete chatData.speaker;
  
      // Determine the recipient users
      let users = [];
      let message= "";
      switch(command) {
        case "whisper":
          message = match[3];
          const names = match[2].replace(/[\[\]]/g, "").split(",").map(n => n.trim());
          users = names.reduce((arr, n) => arr.concat(ChatMessage.getWhisperRecipients(n)), []);
          break;
        case "reply":
          message = match[2];
          const w = this._lastWhisper;
          if ( w ) {
            const group = new Set(w.data.whisper);
            group.add(w.data.user);
            group.delete(game.user._id);
            users = Array.from(group).map(id => game.users.get(id));
          }
          break;
        case "gm":
          message = match[2];
          users = ChatMessage.getWhisperRecipients("gm");
          break;
        case "players":
          message = match[2];
          users = ChatMessage.getWhisperRecipients("players");
          break;
      }
  
      // Ensure we have valid whisper targets
      if ( !users.length ) throw new Error("No target users exist for this whisper.");
      if ( users.some(u => !u.isGM) && !game.user.can("MESSAGE_WHISPER") ) {
        throw new Error("You do not have permission to send whispered chat messages to other players.");
      }
  
      // Update chat data
      chatData.whisper = users.map(u => u._id);
      chatData.content = message;
      chatData.sound = CONFIG.sounds.notification;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Process messages which are posted using a chat whisper command
     * @param {string} command          The chat command type
     * @param {RegExpMatchArray} match  The matched RegExp expressions
     * @param {Object} chatData         The initial chat data
     * @param {Object} createOptions    Options used to create the message
     * @private
     */
    _processChatCommand(command, match, chatData, createOptions) {
      if ( ["ic", "emote"].includes(command) && !(chatData.speaker.actor || chatData.speaker.token) ) {
        throw new Error("You cannot chat in-character without an identified speaker");
      }
      chatData.content = match[2];
  
      // Augment chat data
      if ( command === "ic" ) {
        chatData.type = CONST.CHAT_MESSAGE_TYPES.IC;
        createOptions.chatBubble = true;
      } else if ( command === "emote" ) {
        chatData.type = CONST.CHAT_MESSAGE_TYPES.EMOTE;
        chatData.content = `${chatData.speaker.alias} ${chatData.content}`;
        createOptions.chatBubble = true;
      }
      else {
        chatData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
        delete chatData.speaker;
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Add a sent message to an array of remembered messages to be re-sent if the user pages up with the up arrow key
     * @param {string} message    The message text being remembered
     * @private
     */
    _remember(message) {
      if ( this._sentMessages.length === 5 ) this._sentMessages.splice(4, 1);
      this._sentMessages.unshift(message);
      this._sentMessageIndex = -1;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Recall a previously sent message by incrementing up (1) or down (-1) through the sent messages array
     * @param increment {number}    The direction to recall
     * @return {string}             The recalled message, or null
     * @private
     */
    _recall(increment) {
      if ( this._sentMessages.length > 0 ) {
        this._sentMessageIndex = Math.min(this._sentMessages.length - 1, this._sentMessageIndex + increment);
        return this._sentMessages[this._sentMessageIndex];
      }
      return null;
    }
  
    /* -------------------------------------------- */
  
    /**
     * Compendium sidebar Context Menu creation
     * @param html {jQuery}
     * @private
     */
    _contextMenu(html) {
  
      // Entry Context
      const entryOptions = this._getEntryContextOptions();
      Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
      if (entryOptions) new ContextMenu(html, ".message", entryOptions);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Get the ChatLog entry context options
     * @return {object[]}   The sidebar entry context options
     * @private
     */
    _getEntryContextOptions() {
      return [
        {
          name: "CHAT.PopoutMessage",
          icon: '<i class="fas fa-external-link-alt fa-rotate-180"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            return message.getFlag("core", "canPopout") === true;
          },
          callback: li => {
            const message = game.messages.get(li.data("messageId"));
            new ChatPopout(message).render(true);
          }
        },
        {
          name: "CHAT.RevealMessage",
          icon: '<i class="fas fa-eye"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            const isLimited = message.data.whisper.length || message.data.blind;
            return isLimited && (game.user.isGM || message.isAuthor) && message.isContentVisible;
          },
          callback: li => {
            const message = game.messages.get(li.data("messageId"));
            return message.update({whisper: [], blind: false});
          }
        },
        {
          name: "CHAT.ConcealMessage",
          icon: '<i class="fas fa-eye-slash"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            const isLimited = message.data.whisper.length || message.data.blind;
            return !isLimited && (game.user.isGM || message.isAuthor) && message.isContentVisible;
          },
          callback: li => {
            const message = game.messages.get(li.data("messageId"));
            return message.update({whisper: ChatMessage.getWhisperRecipients("gm").map(u => u.id), blind: false});
          }
        }
      ]
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle keydown events in the chat entry textarea
     * @param {Event} event
     * @private
     */
    _onChatKeyDown(event) {
      const code = game.keyboard.getKey(event);
  
      // UP/DOWN ARROW -> Recall Previous Messages
      if (["ArrowUp", "ArrowDown"].includes(code)) {
        event.preventDefault();
        let textarea = event.currentTarget,
          message = this._recall(code === "ArrowUp" ? 1 : -1);
        if (message) textarea.value = message;
      }
  
      // ENTER -> Send Message
      else if ((code === "Enter") && !event.shiftKey) {
        event.preventDefault();
        let textarea = event.currentTarget,
          message = textarea.value;
        if (!message) return;
  
        // Prepare chat message data and handle result
        this.processMessage(message).then(() => {
          textarea.value = "";
          this._remember(message);
        }).catch(error => {
          ui.notifications.error(error);
          throw error;
        });
      }
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle setting the preferred roll mode
     * @param {Event} event
     * @private
     */
    _onChangeRollMode(event) {
      event.preventDefault();
      game.settings.set("core", "rollMode", event.target.value);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle single message deletion workflow
     * @param {Event} event
     * @private
     */
    _onDeleteMessage(event) {
      event.preventDefault();
      const li = event.currentTarget.closest(".message");
      const message = this.collection.get(li.dataset.messageId);
      return message.delete();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle clicking of dice tooltip buttons
     * @param {Event} event
     * @private
     */
    _onDiceRollClick(event) {
      event.preventDefault();
      let roll = $(event.currentTarget),
          tip = roll.find(".dice-tooltip");
      if ( !tip.is(":visible") ) tip.slideDown(200);
      else tip.slideUp(200);
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle click events to export the chat log
     * @param {Event} event
     * @private
     */
    _onExportLog(event) {
      event.preventDefault();
      game.messages.export();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle click events to flush the chat log
     * @param {Event} event
     * @private
     */
    _onFlushLog(event) {
      event.preventDefault();
      game.messages.flush();
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle scroll events within the chat log container
     * @param {UIEvent} event   The initial scroll event
     * @private
     */
    _onScrollLog(event) {
      if ( !this.rendered ) return;
      const log = event.target;
      const pct = log.scrollTop / log.scrollHeight;
      if ( pct < 0.01 ) {
        return this._renderBatch(CONFIG.ChatMessage.batchSize);
      }
    }
  }