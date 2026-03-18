# StatMob — Claude Instructions

## Project Vision
A rich, cinematic football stats dashboard. EPL-first, historically deep (back to ~1997).
Think: body-part hover stats on a player silhouette, season-over-season timelines,
heatmaps, head-to-head matchups, title race animations. Nothing that exists elsewhere.
Dark, dramatic, data-dense but visually beautiful.

## Stack
- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4 (via @tailwindcss/vite, imported as `@import "tailwindcss"`)
- Framer Motion for all animations and page transitions
- React Router v7 for routing
- TanStack React Query for all async data fetching and caching
- Zustand for lightweight global state (filters, selected season/team/player)
- D3.js for custom SVG-based charts and visualisations
- Recharts for standard bar/line/area charts where D3 is overkill
- React Three Fiber + Drei + Three.js for 3D scenes (player model, stadium, etc.)
- Lucide React for all UI icons. Never use @phosphor-icons/react or any other icon lib.
- Radix UI primitives for accessible overlays, tabs, tooltips (no full component library)
- clsx + tailwind-merge for conditional class logic
- axios for HTTP, date-fns for date formatting
- Path alias `@/` maps to `src/`

## Data Sources (decide before building each feature)
- football-data.org — standings, scorers, fixtures, team info (free tier available)
- FBref / StatsBomb open data — deep player stats, expected goals, progressive passes
- API keys go in `.env.local` as `VITE_FOOTBALL_API_KEY` etc. Never commit keys.

## Code Rules (carried from SetScene)
- TypeScript always. No JavaScript files in src/.
- Named exports everywhere except page components (default export for pages).
- Functional components only. No class components.
- No inline styles except for dynamic/computed values (e.g. player position on a pitch).
- Use early returns to reduce nesting.
- Comment the "why", not the "what".
- No loading states or error boundaries unless explicitly requested.
- Do not add features, refactor, or "improve" code beyond what was asked.
- Do not wrap every section in its own component file unless reuse is genuinely likely.
- Do not add docstrings or type annotations to code that wasn't changed.
- Never install a new package without telling the user first and explaining why.

## Folder Structure
```
src/
  components/    Reusable UI components (charts, cards, layout)
  pages/         Route-level page components (default exports)
  hooks/         Custom React hooks (usePlayerStats, useSeasonStandings, etc.)
  lib/           Utility functions, API clients, constants
  data/          Static/seed data, type definitions
  assets/        Images, SVGs, fonts
```

## Workflow Rules (critical — learned the hard way)
- Make all changes locally first.
- Only push to GitHub when the user explicitly says to ("push it", "looks good", etc.).
- Never commit directly to main.
- Branch: feature/description, fix/description, experiment/description.
- Run `npx tsc --noEmit` after any series of changes. Fix all errors before stopping.
- Before touching routing or shared layout: flag it to the user first.

## Visual Principles
- Dark-first. Background: #0a0a0f or similar deep navy/charcoal.
- Accent palette: electric green (#39FF14 or similar) for positive stats,
  amber for neutral, red for negative. Premier League purple as a brand anchor.
- Typography: bold display font for big numbers, clean sans for body.
- Transitions: fast and physical (spring-based with Framer Motion).
- Never use generic dashboard chrome. Every element should feel intentional.

## Git
- Branch naming: feature/description, fix/description
- Never force push main
- Keep commits small and scoped
