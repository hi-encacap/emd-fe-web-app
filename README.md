# Kairos Drift

_Drift through the right moments._ (Kairos — the opportune moment to act.)

A minimalist, local-first web app for picking tiny "side quests" for everyday life:
open it, get a quest card, shuffle if it doesn't fit your mood, hit **Done** when you
do it. Completions are recorded as events — the same quest can be done many times.

Cozy, no-pressure. Not a todo app, not a habit tracker. See [docs/brief.md](docs/brief.md).

## Tech stack

- **Next.js** (App Router, React 19) + **TypeScript** (strict)
- **Tailwind CSS v4** — design tokens live in [`src/app/globals.css`](src/app/globals.css) `@theme`
- **Zustand** for state, persisted via a swappable repository
- **Zod** — schemas are the source of truth; types are inferred from them
- **motion** (in-card animation) + **next-view-transitions** (cross-route crossfade)
- **lucide-react** icons

Local-first: data lives in `localStorage`. No backend, no account, no tracking.

## Scripts

```bash
pnpm dev          # start the dev server
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm validate     # typecheck + lint + build (the quality gate)
pnpm format       # prettier --write
```

## Architecture

```
src/
├── app/                  # routes: / (Pick), /library, /history + layout/providers
├── components/
│   ├── app/              # AppChrome (shell), Nav, TwoColumn layout
│   ├── screens/          # PickScreen, LibraryScreen, HistoryScreen
│   ├── quests/           # QuestCard, MiniQuestRow, CompletionRow
│   └── ui/               # EmptyState
├── features/quests/      # domain core (framework-agnostic, pure where possible)
│   ├── data/quests.seed.json   # the editable seed deck — add/edit/remove here
│   ├── questTypes.ts     # Zod schemas + inferred types
│   ├── questSeed.ts      # validates the JSON, builds initial state
│   ├── questPicker.ts    # weighted random picker (pure)
│   ├── questSelectors.ts # filtering / search / completion counts (pure)
│   ├── questStorage.ts   # versioned (de)serialization for the persisted blob
│   ├── questMigrations.ts# schema migrations for stored data
│   └── questStore.ts     # Zustand store (state + actions)
├── hooks/                # useDeck, useQuestActions, useDonePulse
├── lib/                  # id / clock / logger
└── platform/             # SCALE SEAMS (interfaces + no-op impls)
    ├── repository/       # QuestRepository (localStorage now; swap for cloud later)
    ├── auth/             # AuthProvider (NoopAuthProvider today)
    └── entitlements/     # Entitlements (AllFreeEntitlements today)
```

### Editing the deck

Quests live in [`src/features/quests/data/quests.seed.json`](src/features/quests/data/quests.seed.json).
Each entry needs `id`, `title`, `prompt`, and `tags`. The JSON is validated at load,
so a malformed entry fails fast.

### Built to scale

The app is local-first today but structured so future features slot in without a
rewrite:

- **Cloud sync / different storage** — implement `QuestRepository` (e.g. a
  `SupabaseQuestRepository`) and swap the instance in `src/platform/repository/index.ts`.
  The store and UI don't change. The append-only completion log is sync-friendly.
- **Accounts** — implement `AuthProvider`; the rest of the app gains a user.
- **Paid quest-packs / premium** — gate on `entitlements.has("feature")`; a no-op
  today, a real check once purchases exist.
- **Stored-data evolution** — bump `CURRENT_SCHEMA_VERSION` and add a migration in
  `questMigrations.ts`; existing users' data is upgraded in place.

## Deploy

Connect the repo to **Vercel** — it auto-detects Next.js. The app ships as static
prerendered pages with a client island, so it's fast and cheap to host. No env vars
are required for the MVP.
