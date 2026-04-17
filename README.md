# SOL React Component Library

React component library migrated from the [SOL Angular component library](https://github.com/nice-cxone/sol-components) using a custom Claude Code agent.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Migrate a Component](#migrate-a-component)
  - [Basic Usage](#basic-usage)
  - [All Flags](#all-flags)
  - [Supported Target Frameworks](#supported-target-frameworks)
- [What the Agent Does — Step by Step](#what-the-agent-does--step-by-step)
  - [Step 1 — Resolve Names & Framework](#step-1--resolve-names--framework)
  - [Step 2 — Read Angular Source Files](#step-2--read-angular-source-files)
  - [Step 3 — Print Analysis Report](#step-3--print-analysis-report)
  - [Step 4 — Sync Dependencies](#step-4--sync-dependencies)
  - [Step 5 — Pre-flight Check](#step-5--pre-flight-check)
  - [Step 6 — Write Target Files](#step-6--write-target-files)
  - [Step 7 — Update Barrel Export](#step-7--update-barrel-export)
  - [Step 8 — Validate](#step-8--validate)
  - [Step 9 — Commit & Push](#step-9--commit--push)
- [What Gets Created](#what-gets-created)
- [Rollback & Error Handling](#rollback--error-handling)
- [GitHub Token Setup](#github-token-setup)
- [Available Components](#available-components)
- [Development Commands](#development-commands)

---

## Quick Start

```bash
# Install dependencies
npm install

# Migrate a component (React 18 by default)
/migrate-component button

# Migrate to a specific framework
/migrate-component dropdown --target next.js
/migrate-component spinner --target vue
/migrate-component checkbox --target svelte
```

---

## Migrate a Component

### Basic Usage

Type the slash command directly in Claude Code chat:

```text
/migrate-component <component-name> [--target <framework>] [--no-validate] [--full-test]
```

**Examples:**

```text
/migrate-component checkbox                           ← React 18 (default)
/migrate-component dropdown --target next.js          ← Next.js
/migrate-component spinner --target vue               ← Vue 3
/migrate-component radio-button --target svelte       ← Svelte 5
/migrate-component tabs --no-validate                 ← skip tests, build only
/migrate-component modal --full-test                  ← run entire test suite after migration
/migrate-component text-input --target next.js --no-validate
```

---

### All Flags

| Flag | What it does |
| ---- | ------------ |
| `--target <framework>` | Choose the output framework. Options: `react` (default), `next.js`, `vue`, `svelte` |
| `--no-validate` | Skips tests — build still always runs. Use when iterating quickly |
| `--full-test` | After component tests pass, also runs the entire repo test suite and prints a report |

---

### Supported Target Frameworks

| Framework | Flag value | File format | Notes |
| --------- | ---------- | ----------- | ----- |
| React 18 | `react` or omit | `.tsx` | Default |
| Next.js 14/15 | `next.js` or `nextjs` | `.tsx` + `'use client'` | Server Components where possible |
| Vue 3 | `vue` | `.vue` SFCs | Composition API, `defineProps`/`defineEmits` |
| Svelte 5 | `svelte` | `.svelte` | Runes (`$props`, `$state`, `$derived`) |

---

## What the Agent Does — Step by Step

When you run `/migrate-component <name>`, here is exactly what happens:

---

### Step 1 — Resolve Names & Framework

The agent converts your input into the variables used throughout the migration:

| Variable | Example (input: `dropdown --target next.js`) |
| -------- | -------------------------------------------- |
| `kebabName` | `dropdown` |
| `PascalName` | `Dropdown` |
| `framework` | `nextjs` |
| `fileExt` | `.tsx` |
| `testExt` | `.test.tsx` |
| `storiesExt` | `.stories.tsx` |
| `buildCmd` | `npm run build` |
| `testCmd` | `npm run test` |
| `targetPath` | `src/components/Dropdown/` |

---

### Step 2 — Read Angular Source Files

The agent fetches **all** source files from the Angular repo at `github.com/nice-cxone/sol-components` using the GitHub API (authenticated via `GITHUB_TOKEN`).

Files it reads — **all in parallel for speed:**

| File type | What it contains |
| --------- | ---------------- |
| `*.component.ts` | Inputs, outputs, component logic |
| `*.component.html` | Template structure |
| `*.component.scss` | Styles |
| `*.module.ts` | Angular module — used to discover sub-components |
| `*.component.spec.ts` | Unit tests |
| `*.page.ts` | Playwright page objects |
| `enum/*.enum.ts` | TypeScript enums |
| `_stories/*.stories.ts` | Storybook stories (all of them) |
| `_docs/*.mdx` | Documentation pages (all of them) |
| Sub-components | e.g. `dropdown-trigger.component.ts` |

> All fetches run simultaneously — no waiting for one file before starting the next.

---

### Step 3 — Print Analysis Report

Before writing any code, the agent prints a full summary so you can see exactly what it found and what it plans to create:

```text
ANALYSIS REPORT — Dropdown  [target: nextjs]
Source : github.com/nice-cxone/sol-components → projects/ds-components/dropdown/src/lib/

SOURCE FILES DISCOVERED
  17 files found across lib/, trigger/, _docs/, _stories/

COMPONENTS
  Dropdown         → sol-dropdown     (primary)
  DropdownTrigger  → sol-dropdown-trigger  (sub-component)

PROPS (Inputs)
  options, value, placeholder, multiple, disabled, readOnly ...

EVENTS (Outputs)
  onSelectionChange, onOpenStateChange, onSearchChanged ...

FILES TO CREATE
  dropdown.component.ts / .html  → Dropdown.tsx
  dropdown.component.scss        → Dropdown.css
  ...

READY TO GENERATE: 10 nextjs files
```

The agent then **immediately proceeds** — no manual confirmation needed.

---

### Step 4 — Sync Dependencies

The agent checks `package.json` for four required `@niceltd/*` packages:

- `@niceltd/sol-tokens` — CSS design tokens
- `@niceltd/cxone-playwright-test-utils` — E2E utilities
- `@niceltd/eslint-config-cxone` — shared ESLint config
- `@niceltd/cxone-client-platform-services` — platform services

**If all four are already present → this step is skipped entirely** (no GitHub fetch, no delay).

If any are missing, the agent fetches the Angular source `package.json` and adds the missing packages.

---

### Step 5 — Pre-flight Check

Before writing any files, the agent runs:

```bash
git status --short
```

- **Empty output** → safe to proceed
- **Uncommitted changes found** → migration is aborted immediately with a clear message

This ensures that if something goes wrong, a clean rollback is always possible.

---

### Step 6 — Write Target Files

The agent creates all files inside `src/components/<PascalName>/`.

The exact files created depend on what exists in the Angular source — it matches 1-to-1.

**Framework-specific behaviour:**

| Framework | Component file | Styles | Notes |
| --------- | -------------- | ------ | ----- |
| React / Next.js | `Component.tsx` | Separate `Component.css` | Next.js adds `'use client'` where hooks/events are used |
| Vue 3 | `Component.vue` | Inside `<style>` block | No separate CSS file |
| Svelte 5 | `Component.svelte` | Inside `<style>` block | Uses `:global()` to preserve Angular class names |

If any file write fails mid-way → **rollback runs automatically**.

---

### Step 7 — Update Barrel Export

The agent adds the new component to `src/index.ts`:

```typescript
export { Dropdown, DropdownTrigger } from './components/Dropdown';
export type { DropdownProps, DropdownHandle, ... } from './components/Dropdown';
```

---

### Step 8 — Validate

Validation runs in phases. **Build always runs — it cannot be skipped.**

| Phase | When it runs | Command | Typical time |
| ----- | ------------ | ------- | ------------ |
| Build | Always | `npm run build` (or `npm run check` for Svelte) | ~10s |
| Component tests | Always (unless `--no-validate`) | `npx vitest run <PascalName>` | ~5s |
| Full suite | Only with `--full-test` | `npm run test` | 60–120s |

**If build fails or component tests fail** → rollback runs automatically and a detailed failure report is printed.

**If `--full-test` is passed**, a full suite report is printed:

```text
FULL SUITE REPORT
  Total test files : 15
  Passed           : 15
  Failed           : 0
  Duration         : 48s
  Dropdown         : 32/32 passed ✅
```

---

### Step 9 — Commit & Push

Once all validation passes:

```bash
git add src/components/<PascalName>/ src/index.ts
git commit -m "feat(dropdown): migrate Angular SOL Dropdown to nextjs"
git push origin main
```

After pushing, the agent prints the final **Migration Report** showing every Angular source file mapped to its output file, with ✅/⬜ status and a coverage summary.

---

## What Gets Created

For a component like `dropdown`, the agent creates:

```text
src/components/Dropdown/
├── Dropdown.tsx                          ← primary component
├── DropdownTrigger.tsx                   ← sub-component (if found in source)
├── Dropdown.css                          ← styles (React/Next.js only)
├── Dropdown.test.tsx                     ← vitest + @testing-library tests
├── index.ts                              ← barrel export
├── _e2e/
│   └── Dropdown.page.ts                 ← Playwright page object
├── _stories/
│   ├── Dropdown.stories.tsx             ← interactive stories
│   └── DropdownForms.stories.tsx        ← forms/controlled-component stories
└── _docs/
    ├── Dropdown.mdx                     ← overview documentation
    ├── DropdownApi.mdx                  ← API reference
    └── DropdownMigration.mdx            ← Angular → React migration guide
```

> Vue and Svelte: no separate `.css` file — styles are embedded in the `.vue`/`.svelte` file.

---

## Rollback & Error Handling

If **anything fails** at any point after the pre-flight check — file write error, TypeScript error, test failure, or git error — the agent:

1. Deletes all generated files: `rm -rf src/components/<PascalName>/`
2. Restores the barrel: `git checkout src/index.ts`
3. Verifies the tree is clean
4. Prints a **Migration Failure Report** with:
   - Which step failed and the exact command
   - Full error output (every TS error code, every failing test name)
   - Root cause explanation in plain English
   - List of files that were written before the failure
   - Specific fix instructions to resolve the issue

**Nothing is ever committed if validation fails.**

---

## GitHub Token Setup

The source repo `nice-cxone/sol-components` is private. A GitHub token with SSO authorization for the `nice-cxone` org is required.

**One-time setup:**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) with `repo` scope
2. After creating it → click **Configure SSO** → **Authorize** next to `nice-cxone`
3. Add it to `.claude/settings.local.json` (gitignored, never committed):

```json
{
  "env": {
    "GITHUB_TOKEN": "your_token_here"
  }
}
```

1. Restart Claude Code — the token is available automatically in every migration.

> **Never paste tokens in chat** — they get stored in conversation history.

---

## Available Components

The following Angular components can be migrated:

`accordion` · `action-bar` · `autocomplete` · `breadcrumb` · **`button ✅`** · `calendar` · `card` · **`checkbox ✅`** · **`chip ✅`** · **`chip-group ✅`** · **`conversation ✅`** · **`date-picker ✅`** · `date-range-picker` · **`dropdown ✅`** · `grid` · `icon` · `info-overlay` · `inline-notification` · `label` · `label-error-message` · `menu` · `modal` · `numeric-selector` · `omnibar` · `progress-bar` · `query-builder` · `radio-button` · `range-slider` · `select` · `spinner` · `status-indicator` · `switch` · `tabs` · `tagify` · `text-area` · `text-counter` · `text-input` · `time-duration` · `time-picker` · `toastr` · `toggle-group` · `tooltip` · `translation` · `wizard`

---

## Development Commands

```bash
npm install                # Install dependencies
npm run storybook          # Start Storybook on port 6007
npm run test               # Run all tests
npm run test:watch         # Tests in watch mode
npm run build              # TypeScript compile
npm run lint               # ESLint
npm run build-storybook    # Build static Storybook
```
