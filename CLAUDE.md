# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless stated otherwise.

```bash
npm run dev              # client (vite :5173) + server (:3001) concurrently
npm run build            # shared → server → client (order matters)
npm run build:static     # shared + client only (GitHub Pages)
npm run apply-diff       # apply pokedex diff via packages/shared/scripts/apply-pokedex-diff.ts
```

Per-workspace (prefer `-w @gatchamon/<pkg>`):
```bash
npm run dev   -w @gatchamon/server     # tsx watch with --env-file=../../.env
npm run dev   -w @gatchamon/client     # vite dev server
npm run build -w @gatchamon/shared     # tsc, emits dist/ consumed by client+server
npm run typecheck -w @gatchamon/shared # tsc --noEmit
npm run test  -w @gatchamon/shared     # vitest run (only package with tests)
npx vitest run path/to/file.test.ts    # single file
npx vitest run -t "test name"          # single test by name
```

The client `dev` proxies `/api` → `localhost:3001` (see `packages/client/vite.config.ts`). The `.env` at the repo root is loaded by the server via `--env-file`; client reads `import.meta.env` only.

## Architecture

Monorepo with three npm workspaces: **`shared`** (pure TS data + battle engine), **`server`** (Express + SQLite), **`client`** (React + Vite + Zustand).

### The shared package is load-bearing

`@gatchamon/shared` is imported by both client and server and holds:
- **Battle engine** (`src/battle/engine.ts`) — pure functions: state in, state + logs out. No I/O. Client uses it for animations and previews; server uses it for authoritative resolution.
- **Pokédex data** (`src/data/pokedex/gen1..gen9.ts`, `forms.ts`) — 1300+ templates.
- **Skills** (`src/data/skills/gen1..gen9.ts`, `*-shiny.ts`) — every Pokémon has a shiny-specific passive variant.
- **Region / tower / dungeon / item / essence / type-change / mission / trophy / arena definitions** under `src/data/`.
- **Formulas** (`src/constants/formulas.ts`, `held-item-formulas.ts`) and the **effect registry** (`src/constants/effects.ts` — 30+ effects, buff/debuff/instant classification).
- All cross-package **types** (`src/types/`).

Build order is enforced in `package.json`: `shared → server → client`. Client and server import from `@gatchamon/shared` (the compiled `dist/`). If you change shared types, rebuild shared before the consumers will typecheck.

### Client → Server is the source of truth

The client used to have an offline/client-only mode. It was removed (commit `e071a3a`, changelog 0.7.0). **All game state now lives on the server** — the client calls `/api/*` for everything and mirrors results into Zustand stores.

- `packages/client/src/services/api.ts` — thin fetch wrapper; attaches `Authorization: Bearer <jwt>`, auto-reloads page on 401.
- `packages/client/src/services/server-api.service.ts` / `server-player.service.ts` — typed endpoint wrappers.
- `packages/client/src/stores/gameStore.ts` — canonical Zustand store. Most mutations call the server then `reloadFromServer(set, get)` which re-fetches player + collection + held items. Do not add local-only mutations that bypass the server.
- Three stores total: `gameStore`, `repeatBattleStore`, `tutorialStore`.

Auth is **Google OAuth → server-issued JWT**, stored in `localStorage` (`gatchamon_auth_token`). `packages/server/src/auth/middleware.ts` gates everything except `/api/auth` and `/api/health`. `/api/admin` requires the email in `packages/server/src/auth/admin.ts`.

### Server layout

`packages/server/src/index.ts` mounts all routers. The pattern is `routes/<domain>.ts` → `services/<domain>.service.ts` → `db/schema.ts` (single file, all migrations inline via `ALTER TABLE ... ADD COLUMN` wrapped in try/catch for idempotency — when adding a column, add a new `migrateXxx` function and call it from `initDb()`).

Battles are held **in-memory** in `Map<string, BattleState>` inside `services/battle.service.ts`. They do not survive a server restart — this is intentional; clients either finish the battle or lose it.

### Client layout

- **Routing** in `src/App.tsx`. Most pages are `React.lazy` — adding a new page means adding both the lazy import and the `<Route>`.
- **Pages** (`src/pages/`) own their CSS (`Foo.tsx` + `Foo.css`). Use existing CSS files — this codebase is pure CSS, no Tailwind or CSS-in-JS.
- **Battle animations** live in `src/battle/animations/` and are built on **GSAP**. `animation-engine.ts` is the orchestrator; `moves/` holds per-skill visuals; `effect-pool.ts` recycles DOM elements. Audio sync goes through `audio-sync.ts` / `audio-manager.ts`.
- **Service worker** is generated at build time by a custom Vite plugin (`vite.config.ts` → `generateSW`). Every build gets a fresh `CACHE_NAME` so users pick up new code on next navigation. The update banner flow is in `src/services/sw-update.ts` + `components/UpdateBanner.tsx`.
- **Asset URLs** go through `utils/asset-url.ts` because the app is deployable under `base: './'` (relative) — never hardcode `/backgrounds/...` paths.

### Key cross-cutting conventions

- **Shiny system**: a shiny Pokémon uses an alternate passive skill (see `data/skills/*-shiny.ts` and `getShinyAlternatePassive`). `DEBUG_MODE=true` in `.env` boosts shiny rates.
- **Active Pokédex / gen filter**: `data/gen-filter.ts` exposes `ACTIVE_POKEDEX` and `GEN_RESTRICTION_ENABLED`. Use `isActivePokemon` / `resolveActiveId` when iterating over possible templates — do not loop over `POKEDEX` directly for gameplay features.
- **Effect IDs vs. legacy effects**: `engine.ts` has `resolveEffectId` that maps legacy `{type, stat}` skill effects to the new `EffectId` registry. New skills should set `effect.id` directly; don't reintroduce legacy shapes.
- **Rewards/drops**: granted exactly once via `grantedFlags` on the player. Syncing happens on every login (`syncGrantedFlags` in `gameStore.ts`). Don't re-grant.
- **Tutorial-forced summons**: `gameStore.summon` forces specific template IDs at tutorial steps 4/5 — keep this in sync if tutorial steps change.
- **Changelog**: per user preference, update `packages/client/src/data/changelog.ts` (newest-first) when shipping a user-visible change.

## Deployment

Two paths:
- **Railway / Fly.io** — full stack (client served by Express). `Dockerfile` is multi-stage; `fly.toml` targets Paris CDG. In production `server/src/index.ts` serves `packages/client/dist` with SPA fallback.
- **GitHub Pages** — static-only via `npm run build:static` and `.github/workflows/deploy.yml`. In this mode the client needs a separately deployed API origin.

SQLite DB path comes from `DATABASE_PATH` env var, else `packages/server/gatchamon.db` (gitignored via `*.db`).
