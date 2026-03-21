# FMMUA Version Migration — Manual Testing Guide

This guide covers every user-facing feature. Test against a Foundry VTT instance with the built system installed (`npm run dev`).

## Prerequisites

- Foundry VTT running with the fmmua system active
- A world with at least one Scene
- Two user accounts: one GM, one Trusted player (for token deletion tests)
- Browser console open (F12) to watch for errors throughout

---

## 1. System Load

- [x] System appears in Foundry's system list and can be activated
- [x] World loads without errors in the browser console
- [x] Chat log shows a d6 icon (not d20) in the chat controls

---

## 2. Actor Creation

### Character

- [x] Create a new Character actor
- [x] Name defaults to "New Character"
- [x] Common Powers compendium pack loads and powers are auto-added
- [x] Open the token config — verify:
  - Actor Link: enabled
  - Display Bars: Hover
  - Display Name: Hover
  - Bar 1: HP
  - Vision: dim sight 6
  - Disposition: Friendly
- [x] Check default permissions: Observer for all users

### Monster

- [x] Create a new Monster actor
- [x] Name defaults to "New Monster"
- [x] No common powers loaded
- [x] Token config:
  - Actor Link: disabled
  - Disposition: Hostile
  - Same bar/display settings as character

---

## 3. Character Sheet — Adventure Tab

This is the left tab, focused on non-combat character details.

- [x] Tab switches correctly between Adventure and Tactical
- [x] **Header**: Name and Level fields are editable, save on change
- [x] **Background**: Text field editable
- [x] **Origin**: Text field editable
- [x] **Skills**: 16 text input slots
  - [x] Left-click the roll icon → instant d6 skilled roll in chat
  - [x] Right-click the roll icon → RollDialog opens with flavor pre-filled
  - [x] Roll result shows semantic interpretation (Twist/Success/etc.)
- [x] **Complications**: 4 text slots, editable and persist on save
- [x] **Tricks**: 5 text slots
- [x] **Fallback**: Text field
- [x] **Wealth**: Radio buttons (Penniless/Poor/Rich/Super-rich), selection persists
- [x] **Notes/Motivation**: Textarea, content persists
- [x] **Relationships**: Textarea, content persists
- [x] **Kit**: Text field
- [x] **Advances**: 6 text slots
- [x] **Flaws and Favors**: 5 text slots
- [x] **Conditions**: Checkboxes (winded, exhausted, injured, etc.) toggle and persist

---

## 4. Character Sheet — Tactical Tab

- [x] **Class** and **Role**: Text fields, persist
- [x] **Speed**: Number field, persists
- [x] **HP**: Current/Max number fields, persist
- [x] **AP**: Current value, persists
- [x] **MT**: Current value, persists
- [x] **Strikes**: Current value, persists
- [x] **Size**: Width/Height number fields, persist

### Items on Tactical Tab

- [x] **Feats section**: Shows traits with source="feat"
- [x] **Role Boost section**: Shows traits with source="role"
- [x] **Class Feature section**: Shows traits with source="class"
- [x] **Powers section**: Shows all power items
  - [x] With "Group Powers" setting ON: powers grouped by Class/Role/Other
  - [x] With "Group Powers" setting OFF: flat sorted list
- [x] Trait text has tooltip on hover (via Tippy)

### Active Effects

- [x] Click **+** to add an ActiveEffect → Foundry effect editor opens
- [x] Click **pencil** to edit an existing effect
- [x] Click **trash** to delete an effect (slides up then removes)

---

## 5. Monster Sheet

- [x] **Header**: Name, Level, HP current/max all editable
- [x] **Rank**: Dropdown (Stooge/Goon/Standard/Elite/Champion), persists
- [x] **Speed**: Number field
- [x] **Size**: Width/Height fields
- [x] **Traits section**: Add/edit/delete/display buttons work
- [x] **Powers section**: Add/edit/delete/use buttons work

---

## 6. Item Operations (on any actor sheet)

- [x] **Add item**: Click + on a section → new item created with correct type and source
- [x] **Edit item**: Click pencil → item sheet opens
- [x] **Delete item**: Click trash → item slides up and is removed
- [x] **Display item**: Click eye → power/trait card appears in chat
- [x] **Use power**: Click d6 → executes macro script (if any) or displays card
- [x] **Drag to hotbar**: Drag a power from the sheet to a hotbar slot → macro created

---

## 7. Power Sheet

- [x] **Card tab**:
  - [x] Source dropdown (Role/Class/Common)
  - [x] Action dropdown (Free/Move/Role/Attack/Reaction/Interrupt/None)
  - [x] Usage dropdown (At-Will/Encounter/Custom)
  - [x] Custom Usage text field (auto-syncs with usage dropdown)
  - [x] Target configuration: melee checkbox, range, burst, damage fields
  - [x] Custom Target text field
  - [x] Custom Image file picker
  - [x] Text editor (HTML)
  - [x] All fields persist on save
- [x] **Macro tab**:
  - [x] Script textarea with syntax highlighting
  - [x] Highlighting updates as you type
  - [x] Script persists on save

---

## 8. Trait Sheet

- [x] Source dropdown (Feat/Role/Class)
- [x] Text editor (HTML)
- [x] Fields persist on save

---

## 9. Dice Rolling

### Via Chat Command

- [x] Type `/sroll` → RollDialog opens
- [x] Type `/sroll Flavor text` → RollDialog opens with flavor pre-filled

### RollDialog

- [x] Type dropdown: attack / save / skilled / unskilled
- [x] Advantage checkbox → rolls 2d6kh
- [x] Disadvantage checkbox → rolls 2d6kl
- [x] Neither → rolls 1d6
- [x] Flavor text field included in chat output
- [x] Roll result shows semantic tag appropriate to type:
  - Attack: Miss / Glancing Hit / Solid Hit / Critical Hit! / Strike!
  - Save: Failure / Success
  - Skilled: Twist with a Cost / Twist / Success with a Cost / Success / Success with a Bonus
  - Unskilled: similar but with "learn Skill!" variants on 6

### Chat Roll Display

- [x] Shows formula and dice values
- [x] Shows semantic interpretation
- [x] Roll details (die values) visible inline below the formula

### Quick Roll

- [x] Click the d6 icon in chat controls → RollDialog opens

---

## 10. Combat Tracker

### Setup

- [x] Create a combat encounter
- [x] Add characters and monsters as combatants
- [x] Roll initiative → d6 results appear

### Resource Display

- [x] Each combatant row shows:
  - [x] **Strikes**: Displayed as `!` indicators (one per strike)
  - [x] **AP**: Gold-colored number (if > 0)
  - [x] **MT**: Purple-colored number (if > 0)
  - [x] **HP**: Color-coded (light green > 50%, green > 0, red <= 0)
- [x] Resources update when actor data changes (edit HP on sheet → tracker updates)

### Operations

- [x] Previous/Next Turn buttons work
- [x] Right-click a combatant → context menu includes **Duplicate Combatant**
- [x] Duplicate Combatant creates a copy of the combatant entry
- [x] Gear icon opens combat settings dialog

### Pop-out

- [x] Pop out the tracker → resource tracking syncs between main and pop-out

---

## 11. Macro Execution

### Hotbar

- [ ] Drag a power with a script from a sheet to the hotbar
- [ ] Macro appears with power name and image
- [ ] Click the hotbar macro → power executes (same as clicking Use on sheet)
- [ ] Rename a power → hotbar macro name updates automatically

### Script Execution (requires a power with a script)

Create a test power with this script in the Macro tab:
```javascript
let targets = await pickTargets();
let hits = await rollAttacks(targets);
await applyDamage(2, hits);
```

- [ ] Click Use → Pick Targets dialog opens showing tokens in range
- [ ] Select targets from dropdowns → attack rolls appear in chat
- [ ] Damage applied to hit targets (HP decreases)
- [ ] Summary message appears in chat

### payCost

Create a power with script: `await payCost("ap")`
- [ ] Using the power deducts 1 AP from the actor
- [ ] If AP is 0, shows warning and cancels

---

## 12. Chat Commands

- [x] `/shelp` → displays command reference table in chat (whispered)
- [x] `/sroll` → opens RollDialog
- [x] `/sroll testing` → opens RollDialog with "testing" flavor
- [x] `/sglossary` → opens Glossary window at "Ally" entry
- [x] `/sglossary Opportunity` → opens Glossary at the matching entry
- [x] `/spower` (with a token selected) → lists powers for that token's actor
- [x] `/spower Power Name` (with token selected) → executes that power

---

## 13. Glossary

- [x] Glossary window opens and displays categories
- [x] Click a category → entries appear
- [x] Click an entry → scrolls to and highlights it
- [x] Window is resizable and remembers size
- [x] With "Glossary Chat Links" setting ON: glossary terms in chat messages become clickable links
- [x] With setting OFF: no auto-linking

---

## 14. Token Size Sync

- [x] Edit a character's Size width/height on the Tactical tab
- [x] All linked tokens on the scene update to match

---

## 15. Player Token Deletion

Test as a **Trusted** player (not GM):

- [x] Select an owned token on the canvas
- [x] Press Delete or Backspace → token is removed
- [x] Attempt with no GM connected → error message "No GM connected"
- [x] Attempt on an unowned token → warning message about permissions

---

## 16. Settings

Open Foundry's Module Settings:

- [x] **Group Powers** toggle exists (client scope)
  - ON: Character tactical tab groups powers by Class/Role/Other
  - OFF: Flat sorted list
  - Changing setting immediately re-renders open character sheets
- [x] **Glossary Chat Links** toggle exists (client scope)
  - Controls auto-linking of terms in chat

---

## 17. Compendium

- [x] "Common Powers" compendium pack appears in the Compendium tab
- [x] Opening it lists the Strike RPG common powers
- [x] Items can be dragged from the compendium to an actor sheet

---

## 18. Error Conditions

- [ ] Using a power on an actor you don't own → "Actor is not owned" error
- [ ] Using an item that isn't a power → "Item is not a power" error
- [ ] Macro script with a syntax error → error notification + console details
- [ ] Pick Targets with no tokens in range → warning message

---

## Summary Checklist

| Area | Status |
|------|--------|
| System loads | |
| Character creation + defaults | |
| Monster creation + defaults | |
| Character Adventure tab | |
| Character Tactical tab | |
| Monster sheet | |
| Item add/edit/delete/display/use | |
| Power sheet (both tabs) | |
| Trait sheet | |
| Dice rolling (all types) | |
| RollDialog (adv/disadv) | |
| Combat tracker + resources | |
| Combatant duplicate | |
| Macro hotbar drag-and-drop | |
| Macro script execution | |
| Chat commands (/shelp, /sroll, /sglossary, /spower) | |
| Glossary window + chat links | |
| Token size sync | |
| Player token deletion | |
| Settings toggles | |
| Compendium | |
| Error handling | |
