# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FMMUA is a **Foundry VTT system** implementing the [Strike RPG](https://www.strikerpg.com/) tabletop game. It targets **Foundry VTT V9**. It provides character/monster sheets, custom dice rolling, combat tracking, a rules glossary, and scriptable power macros.

## Build Commands

```bash
npm run build       # Vite build + copy static assets to dist/
npm run dev         # Build + install to local Foundry VTT data directory
npm run watch       # Build, install, then watch for changes (continuous rebuild)
npm run release     # Build + create rel/fmmua.zip for distribution
npm run clean       # Remove dist/
```

The install step auto-detects the Foundry data path: `%LOCALAPPDATA%/FoundryVTT` on Windows, `~/Library/Application Support/FoundryVTT` on macOS, or `$FOUNDRY_VTT_DATA_PATH` on Linux.

There are no tests or linting configured.

## Architecture

**Entry point**: `src/main.ts` registers all subsystems on Foundry's `"init"` hook.

Each subsystem lives in its own directory and exports an `_init()` function:

- **actors/** - Actor data model (character/monster), sheet UIs with Adventure and Tactical tabs
- **items/** - Item data model (power/trait), sheet UIs, and chat card rendering
- **dice/** - Custom d6-based roll system with semantic tags (attack/save/skilled/unskilled) and advantage/disadvantage
- **combat/** - Custom Combat class and tracker with resource tracking
- **glossary/** - In-game rules reference with auto-linking of terms in chat messages
- **macros/** - Scriptable power execution via sandboxed AsyncFunction; MacroAPI exposes `pickTargets()`, `rollAttacks()`, `applyDamage()`, etc.
- **commands.ts** - Chat command registration

**WebSocket messages**: Subsystems register `MessageHandler` callbacks for the `StrikeMessage` union type (defined in `src/messages.d.ts`) to handle multi-player communication via `game.socket`.

## Tech Stack

- **TypeScript** (strict mode, ES2017 target) compiled via Vite
- **SCSS** for styling, compiled to a single `main.css`
- **Handlebars** templates (`.html` files) for Foundry sheet rendering
- Foundry API types from `@league-of-foundry-developers/foundry-vtt-types`
- Third-party libs bundled in `src/lib/` (Highlight.js, Tippy.js, Popper.js)

## Build Pipeline

Vite builds `src/main.ts` into `dist/main.js` (ES module) and `dist/main.css`. The `scripts/copy-assets.js` post-build step copies HTML templates, images, JSON (with comment stripping), and JS libs from `src/` to `dist/`.

## Conventions

- PascalCase filenames for classes (`StrikeActor.ts`, `CharacterSheet.ts`), camelCase for utility modules (`dice.ts`, `combat.ts`)
- Each subsystem's `_init()` registers Foundry hooks, document classes, and sheet applications
- Data interfaces live in `*Data.ts` files; sheet classes in `*Sheet.ts` files
- Source control uses Jujutsu (`.jj` directory)
