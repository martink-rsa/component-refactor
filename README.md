# component-refactor

A pnpm monorepo for refactoring React components. The web app lives in
[`apps/web`](./apps/web); shared packages can be added under `packages/`.

## Tech stack

- **[pnpm](https://pnpm.io/) workspaces** — monorepo management
- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite 8](https://vite.dev/)** — dev server & build
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** — unit/component tests (jsdom)
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** — linting & formatting

## Prerequisites

- **Node.js** `>=20`
- **pnpm** `10.33.0` (pinned via the `packageManager` field — run `corepack enable` to use it automatically)

## Getting started

```bash
pnpm install      # install all workspace dependencies
pnpm dev          # start the web app dev server (Vite, with HMR)
```

## Repository structure

```
component-refactor/
├── apps/
│   └── web/                  # @component-refactor/web — the React + Vite + TS app
│       ├── src/
│       │   ├── components/   # React components (aliased as @components)
│       │   ├── lib/          # framework-agnostic helpers (aliased as @lib)
│       │   └── test/         # Vitest setup
│       ├── vite.config.ts    # Vite + Vitest config (aliases, test env)
│       └── tsconfig.*.json
├── pnpm-workspace.yaml        # workspace globs: apps/*, packages/*
└── package.json              # root scripts + pinned package manager
```

## Scripts

Root scripts target the web app via pnpm's `--filter`. The `:all` variants run
the script across **every** workspace package (`pnpm -r`).

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `pnpm dev`           | Start the web app dev server                              |
| `pnpm build`         | Type-check (`tsc -b`) and build the web app for production |
| `pnpm preview`       | Preview the production build locally                      |
| `pnpm lint`          | Run ESLint                                                |
| `pnpm format`        | Format the codebase with Prettier (writes changes)        |
| `pnpm format:check`  | Check formatting without writing                          |
| `pnpm test`          | Run the test suite once (Vitest)                          |
| `pnpm dev:all` · `pnpm build:all` · `pnpm lint:all` · `pnpm format:all` · `pnpm test:all` | Same, across all packages |

Inside `apps/web` the same scripts are available directly, plus
`lint:fix` (`eslint . --fix`) and `test:watch` (`vitest` in watch mode). Run any
package script from the root with, e.g.:

```bash
pnpm --filter @component-refactor/web test:watch
```

## Path aliases

The web app defines path aliases in **two** places that must stay in sync:
`resolve.alias` in `apps/web/vite.config.ts` (for Vite & Vitest) and `paths` in
`apps/web/tsconfig.app.json` (for the compiler & editor).

| Alias          | Resolves to          |
| -------------- | -------------------- |
| `@/*`          | `src/*`              |
| `@components`  | `src/components`     |
| `@lib`         | `src/lib`            |

```ts
import { Button } from '@components/Button'
import { cn } from '@lib/cn'
```

## Testing

Tests run on [Vitest](https://vitest.dev/) with the `jsdom` environment and
[Testing Library](https://testing-library.com/). Specs live next to the code
they cover (`*.test.ts` / `*.test.tsx`); jest-dom matchers and DOM cleanup are
registered in `apps/web/src/test/setup.ts`.

```bash
pnpm test                                          # run once
pnpm --filter @component-refactor/web test:watch   # watch mode
```

## Adding a package

1. Create a folder under `apps/` (an app) or `packages/` (a shared library) —
   both are already covered by `pnpm-workspace.yaml`.
2. Give it a `package.json` with a workspace name (e.g. `@component-refactor/ui`).
3. Run `pnpm install` to link it into the workspace.
