# FMMUA Foundry VTT Migration Notes

Migration path: **V0.7 → V9 → V10 → V12 → V13**

---

## V0.7 → V9 (completed)

This step absorbed the V8 "Entity → Document" transition and the V9 removal of Entity compat shims.

### API changes applied

| Category | Old (V0.7) | New (V9) |
|----------|-----------|----------|
| CONFIG registration | `CONFIG.Actor.entityClass` | `CONFIG.Actor.documentClass` |
| Owned item CRUD | `createOwnedItem()`, `getOwnedItem()`, `deleteOwnedItem()` | `createEmbeddedDocuments("Item", [...])`, `actor.items.get()`, `deleteEmbeddedDocuments("Item", [...])` |
| Embedded entity CRUD | `*EmbeddedEntity("Type", data)` | `*EmbeddedDocuments("Type", [data])` — note array arguments |
| Permission constants | `CONST.ENTITY_PERMISSIONS` | `CONST.DOCUMENT_PERMISSION_LEVELS` |
| Owner check | `.owner` | `.isOwner` |
| Sheet document ref | `.entity` | `.document` |
| Clone utility | `duplicate(x)` | `foundry.utils.deepClone(x)` |
| ChatMessage render | `message.render()` | `message.getHTML()` |
| Compendium | `pack.getContent()` | `pack.getDocuments()` |
| Hook name | `preUpdateOwnedItem` | `preUpdateItem` (different signature: receives item, not actor+itemData) |
| Roll evaluation | `Roll.create(ex).evaluate()` | `Roll.create(ex).evaluate({async: true})` — now async |
| Roll internals | `_rolled`, `roll()`, `_id` | `_evaluated`, `evaluate({async: true})`, `id` |
| User data | `user.data.role` | `user.role` |
| Token documents | `new Token(scene.getEmbeddedEntity("Token", id))` | `scene.tokens.get(id)` — returns TokenDocument directly |
| Permission check | `actor.hasPerm(user, CONST.X)` | `tokenDoc.testUserPermission(user, "OWNER")` |
| Token scene CRUD | `scene.deleteEmbeddedEntity("Token", ids)` | `scene.deleteEmbeddedDocuments("Token", ids)` |
| Token creation | `Token.create(data)` | `scene.createEmbeddedDocuments("Token", [data])` |
| Scene tokens | `scene.getEmbeddedCollection("Token")` | `scene.tokens` |

### getData() structure change

In V0.7, `ActorSheet.getData()` returned `{data: <system data>, items: [...], ...}` where `data` was the actor's custom system data directly. In V9, `DocumentSheet.getData()` returns `{data: <full document data>, ...}` where the system data is nested at `data.data`.

Rather than shimming the old behavior, we updated Handlebars templates to match the V9 data structure. This keeps the code honest and avoids maintaining a compatibility layer.

There is a critical distinction between **display paths** and **update paths** in templates:

- **Display paths** (reading data for rendering): use `data.data.xxx` because `getData()` returns `{data: {_id, name, type, data: {system fields}, ...}}` and Handlebars resolves paths literally.
- **Update paths** (form `name` attributes, editor `target` attributes, `data-edit` attributes): use `data.xxx` because Foundry's form submission interprets `data.xxx` as an update to `document.data.data.xxx` automatically. Using `data.data.xxx` in a `name` attribute silently fails.

**Top-level sheet context** (actor/item fields on the sheet's own document):
- Display: `{{data.xxx}}` → `{{data.data.xxx}}`
- Form inputs: `name="data.xxx"` stays as `name="data.xxx"` (unchanged from V0.7!)
- Editor helpers: `content=data.data.xxx` (display) but `target="data.xxx"` (update)
- Image pickers: `data-edit="data.xxx"` (update)
- Affected templates: `CharacterSheet.html`, `AdventureSheet.html`, `TacticalSheet.html`, `MonsterSheet.html`, `PowerSheet.html`, `TraitSheet.html`

**Inside `{{#each}}` blocks** (items, effects, etc.): The iteration context is the item/effect object itself, where system data is at `.data` (one level, not two). These templates use `data.xxx`, not `data.data.xxx`:
- `PowerCard.html`, `TraitCard.html` — used as partials inside `{{#each powers}}` on actor sheets, and also rendered directly by `StrikeItem.render()` which passes the item's document data
- Trait text/tooltips inside `{{#each feats}}`, `{{#each traits}}`, `{{#each role}}`, `{{#each class}}` in `TacticalSheet.html` and `MonsterSheet.html`

**ActiveEffect fields** in `{{#each effects}}` (`TacticalSheet.html`): `{{icon}}` → `{{data.icon}}`, `{{label}}` → `{{data.label}}`. In V9, ActiveEffect documents don't expose `icon`/`label` as direct accessors — they're on `.data`.

`_getSubmitData()` overrides in `CharacterSheet.ts` and `PowerSheet.ts` use `data.` key prefixes (update paths), not `data.data.`.

### Types package

- Upgraded from `foundry-vtt-types@0.7.10-0` to `9.280.1`
- Upgraded TypeScript from `4.9.5` to `5.7.3` (required for `moduleResolution: "Bundler"`)
- Switched tsconfig to `"module": "ESNext"`, `"moduleResolution": "Bundler"`
- Added `src/foundry-compat.d.ts` with `StrikeItemDataObject<T>` bridge type (replaces the old `Item.Data<T>` namespace which doesn't exist in V9 types)
- Simplified class declarations: `StrikeActor extends Actor` and `StrikeItem extends Item` with no generics (V9 types don't parameterize document classes)
- `game` is typed as `{} | Game` in V9 types (models pre-init state); code uses `(game as Game)` or `game!` where needed

### Other changes

- `StrikeActor.prepareData()` override deleted — it was a V0.7.9 workaround for `duplicate()`d owned item data that's no longer needed
- `system.json`: `packs[].entity` → `packs[].type`, removed `packs[].module`, updated version constraints
- Fixed 6 import paths missing `.js` extensions (required by Node16/Bundler resolution)
- `StrikeTracker`: `this.combat` → `this.viewed`, removed `new Token()` construction in `updateTrackedResources()`

---

## V9 → V10 (next step)

The main theme is the **data model flattening**: `data.data` becomes `system` everywhere.

### Template changes (mechanical)

All templates change again: `{{data.data.xxx}}` → `{{system.xxx}}`, `name="data.data.xxx"` → `name="system.xxx"`. Same 8 template files, same mechanical replacement.

### TypeScript data access

- `actor.data.data` → `actor.system` throughout all `.ts` files
- `item.data.data` → `item.system`
- `user.data.role` → already `user.role` (done at V9)
- `game.world.data.name` → `game.world.id`
- Update keys in `actor.update({"data.data.xxx": val})` → `actor.update({"system.xxx": val})`
- `_getSubmitData()` key prefixes: `data.data.` → `system.`

### Manifest overhaul

- `system.json` field `name` → `id`
- `minimumCoreVersion`/`compatibleCoreVersion` → `compatibility: {minimum, verified, maximum}`

### Other V10 API changes

- `permission` field → `ownership` on documents
- `Actor#token` → `Actor#prototypeToken` (enforced; deprecated shim in V9 still works)
- Token field consolidation: `vision` → `sight.enabled`, `dimSight` → `sight.range`, `img` → `texture.src`
- `CONST.DOCUMENT_PERMISSION_LEVELS` → `CONST.DOCUMENT_OWNERSHIP_LEVELS`
- `DataModel.defineSchema()` available as alternative to `template.json` (optional)
- `Compendium` type changes

### Types

The community `foundry-vtt-types` package has no V10 release. Options: write local declarations for V10-specific APIs, or evaluate the newer `fvtt-types` package which targets V12+.

---

## V10 → V12 (future)

V12 **removes** all APIs deprecated in V9–V10. If the V10 migration is done correctly (using final V10 APIs, not deprecated shims), this step should be mostly validation.

### Key changes

- All V10-era deprecations hard-removed — acts as enforcement of V10 migration completeness
- Compendium packs: NeDB `.db` files → LevelDB folders (tooling exists for conversion)
- `ActiveEffect`: `label` → `name`, `icon` gets `img` alias, new `statuses` Set replaces `flags.core.statusId`
- `CONFIG.ActiveEffect.legacyTransferral` introduced (default `true` in V12)
- `TokenDocument#actorData` → `TokenDocument#delta` (ActorDelta document)
- Embedded document hooks: `_pre*EmbeddedDocuments` → `_pre*DescendantDocuments`
- `TextEditor.enrichHTML` must be fully async (sync path removed)
- **ApplicationV2 introduced** — new application framework available but not required yet
- Dice: Peggy parser replaces old parser; synchronous roll evaluation removed

---

## V12 → V13 (future)

V13 **removes** all APIs deprecated in V11 and makes ApplicationV2 the primary framework.

### Key changes

- All V11-era deprecations hard-removed
- **Sheet migration to ApplicationV2**: `ActorSheet` → `ActorSheetV2`, `ItemSheet` → `ItemSheetV2`, `Application` → `ApplicationV2`. Uses `DEFAULT_OPTIONS` static property instead of `defaultOptions()`. Parts-based rendering. DOM event handling replaces jQuery.
- jQuery deprecated — `activateListeners(html: JQuery)` pattern replaced by DOM-based event handling
- CSS Layers introduced — system styling may need review
- `CONFIG.ActiveEffect.legacyTransferral` default switched to `false`
- Explicit sheet registration required (must register all sheet classes or they revert to defaults)
- Roll modes no longer auto-applied in `ChatMessage._preCreate`
- Localization keys restructured: `{DOCUMENT_NAME}.Type{TypeName}` → `TYPES.{documentName}.{typeName}`
- Scene controls restructured from array to record

### Scope estimate

The ApplicationV2 migration is the headline work — every sheet class (`StrikeActorSheet`, `CharacterSheet`, `MonsterSheet`, `PowerSheet`, `TraitSheet`, `GlossaryWindow`, `RollDialog`, `PickTargetsDialog`, `StrikeTracker`, `MacroSheet`) needs rewriting to the new framework. FMMUA has ~10 sheet classes, so this is bounded but significant work.
