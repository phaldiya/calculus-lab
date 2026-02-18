# CLAUDE.md

Project-specific instructions for Claude Code working on Calculus Lab.

## Project Overview

Calculus Lab is a client-side scientific graphing calculator built with React 19, TypeScript, and Plotly.js. No backend — deployed as a static SPA to GitHub Pages.

## Commands

| Task | Command |
|------|---------|
| Dev server | `bun run dev` (port 5000) |
| Build | `bun run build` |
| Type check | `npx tsc --noEmit` |
| Lint & fix | `bun run lint` |
| Lint check | `bun run lint:check` |
| Format | `bun run format` |
| Test (all) | `bun run test` |
| Test (smoke) | `bun run test:smoke` |
| Test (deep) | `bun run test:deep` |
| Test (coverage) | `bun run test:coverage` |
| Verify (tests + E2E) | `bun run verify` |
| Setup git hooks | `bun run setup-hooks` |
| Screenshots | `bun run scripts/take-screenshots.ts` |

## Tech Stack

- **Runtime**: Bun (package manager + script runner)
- **Framework**: React 19 + react-router-dom 7 (HashRouter)
- **Build**: Vite 7 + @vitejs/plugin-react-swc
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-based config, no tailwind.config)
- **Linting**: Biome 2 (no ESLint/Prettier)
- **Math**: mathjs, KaTeX for rendering
- **Charts**: Plotly.js (via react-plotly.js)
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure

```
src/
  components/
    calculus/       # Derivative, integral, limit inputs + plot
    graphing/       # Equation input, list, graph plot
    layout/         # Header, Sidebar
    matrix/         # Matrix inputs, operations, result
    scientific/     # Scientific calculator panel
    shared/         # Icons, KaTeXRenderer, StepViewer, ErrorBoundary
    statistics/     # Data input, stats results, regression, plot
    DocsPage.tsx    # Documentation page
  context/          # AppContext (React Context + useReducer)
  lib/              # Engines (calculus, matrix, statistics), parsers, helpers
  types/            # TypeScript type definitions (AppState, AppAction, etc.)
```

## Code Conventions

### Git
- **Conventional commits**: `feat:`, `fix:`, `ci:`, `docs:`, `refactor:`
- No `Co-Authored-By` trailer

### Git Hooks
- Run `bun run setup-hooks` to install hooks from `git-hooks/` into `.git/hooks/`
- **pre-commit**: `bun install --frozen-lockfile` → `lint:check` → `test:smoke`
- **pre-push**: `verify` (full test suite + Playwright E2E)

### Formatting (Biome)
- 2 spaces, single quotes, trailing commas, semicolons
- 120 char line width
- Imports sorted: Node > Packages > Aliases > Paths

### Styling
- Tailwind utility classes, no custom CSS except theme variables in `index.css`
- CSS custom properties for theming: `--color-primary`, `--color-bg`, `--color-surface`, etc.
- Dark mode via `.dark` class on `<html>`

### State Management
- Single `AppContext` with `useReducer` pattern
- All state types in `src/types/index.ts`, reducer in `src/context/AppContext.tsx`
- State persisted to localStorage automatically
- Add new actions to `AppAction` union type, then handle in `appReducer`

### Components
- One component per file, default export matching filename
- Calculus/Matrix/Stats panels follow pattern: sidebar inputs + main plot area
- `PlotlyWrapper` for all Plotly charts
- Empty states show Plotly grid with overlay hint text

## Key Patterns

- **Equations/PointData**: Array in global state, individual add/remove/toggle actions
- **Calculus/Matrix/Stats**: Sub-state objects with `SET_*` partial update actions and `CLEAR_*` reset actions
- **Step-by-step solutions**: `*StepEngine` generates steps, `StepViewer` renders them
- **History**: Cross-tab computation log (max 100 entries)
- **Screenshots**: Puppeteer script captures all tabs for docs; run after UI changes

## Deployment

- GitHub Pages via `.github/workflows/deploy.yml`
- Base path: `/calculus-lab/`
- HashRouter for SPA compatibility with static hosting
