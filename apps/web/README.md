# @component-refactor/web

The React + Vite + TypeScript web app for the
[`component-refactor`](../../README.md) monorepo.

## Scripts

Run these from this directory, or from the repo root with
`pnpm --filter @component-refactor/web <script>`.

| Command             | What it does                               |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Start the Vite dev server (HMR)            |
| `pnpm build`        | Type-check (`tsc -b`) and build to `dist/` |
| `pnpm preview`      | Preview the production build               |
| `pnpm lint`         | Run ESLint                                 |
| `pnpm lint:fix`     | Run ESLint and auto-fix                    |
| `pnpm format`       | Format with Prettier (writes changes)      |
| `pnpm format:check` | Check formatting without writing           |
| `pnpm test`         | Run the Vitest suite once                  |
| `pnpm test:watch`   | Run Vitest in watch mode                   |

## Layout

```
src/
├── components/   # React components — import via @components/*
├── lib/          # framework-agnostic helpers — import via @lib/*
├── test/         # Vitest setup (jest-dom matchers + cleanup)
├── App.tsx
└── main.tsx
```

Path aliases (`@/*`, `@components`, `@lib`) are defined in both
[`vite.config.ts`](./vite.config.ts) and [`tsconfig.app.json`](./tsconfig.app.json) —
keep them in sync. See the [root README](../../README.md) for full details.
