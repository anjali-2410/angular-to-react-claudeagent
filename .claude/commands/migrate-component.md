# migrate-component

Migrate an Angular SOL component from the source repo into this React target repo.

## Usage

```
/migrate-component <component-name> [--target <framework>] [--no-validate]
```

**Examples:**
```
/migrate-component checkbox                          ← React 18 (default)
/migrate-component text-input --target next.js       ← Next.js
/migrate-component spinner --target vue              ← Vue 3
/migrate-component radio-button --target svelte      ← Svelte 5
/migrate-component tabs --target next.js --no-validate
```

**Flags:**

- `--target <framework>` — Target framework. Accepted values: `react` (default), `next.js` / `nextjs`, `vue`, `svelte`. Omitting the flag defaults to `react`.
- `--no-validate` — Skip tests only (build always runs). Commits and pushes immediately after a clean build. Use when iterating quickly or when you plan to run tests manually.
- `--full-test` — After the component-scoped tests pass, also run the entire test suite and print a full suite report. Omitting this flag runs only the new component's tests.

---

## What This Agent Does

Reads every Angular source file (`.ts`, `.html`, `.scss`, `.spec.ts`, `.mdx`, `.stories.ts`, `enum/`, `.page.ts`, and any sub-components) from the local clone, generates React equivalents 1-to-1, updates `src/index.ts`, validates (build + tests), then commits and pushes. File mapping rules and step-by-step execution are defined below.

---

## Conversion Rules

### Angular → React Mapping

| Angular | React |
|---------|-------|
| `@Component({ selector: 'sol-foo' })` | `export const Foo: React.FC<FooProps>` |
| `input<T>(default)` | `prop?: T` in interface |
| `output<T>()` | `onEvent?: (val: T) => void` |
| `@HostBinding` | inline `className`, `id`, etc. on root element |
| `@ViewChild` / `viewChild()` | `useRef()` |
| `ViewEncapsulation.None` | Plain CSS (no scoping) |
| `ng-content` | `children: React.ReactNode` |
| Named `ng-content select="[x]"` | render prop or named slot pattern |
| `ngModel` / `ControlValueAccessor` | controlled component pattern |
| `@Optional() @Self()` | not needed — pass as props |
| `@HostListener` | `useEffect` + `addEventListener` |
| Angular `[class.foo]="cond"` | `className={cond ? 'foo' : ''}` |
| Angular Material components | headless React equivalents using CSS |
| AG Grid Angular | `ag-grid-react` (`AgGridReact`) |
| `ngx-toastr` | `react-toastify` |
| `nouislider` | `nouislider` (vanilla JS, use `useEffect`) |

### File Naming

| Angular source | React target |
|----------------|-------------|
| `button.component.ts` | `Button.tsx` |
| `button.component.scss` | `Button.css` |
| `button.component.spec.ts` | `Button.test.tsx` |
| `button.module.ts` | _(not needed)_ |
| `enum/variant.enum.ts` | inline TypeScript union in `Button.tsx` |
| `_docs/button.mdx` | `_docs/Button.mdx` |
| `_docs/button-api.mdx` | `_docs/ButtonApi.mdx` |
| `_docs/button-migration.mdx` | `_docs/ButtonMigration.mdx` |
| `_stories/button.stories.ts` | `_stories/Button.stories.tsx` |
| `_stories/overview-button.stories.ts` | `_stories/ButtonOverview.stories.tsx` |

### Component Name Casing

Convert `kebab-case` → `PascalCase` (e.g. `text-input` → `TextInput`, `chip-group` → `ChipGroup`).

### CSS & SOL Token Rules

**Token source:** `@niceltd/sol-tokens` — repo at `https://github.com/nice-cxone/sol-tokens.git`, already cloned at `C:/Users/anjsonawane/sol-tokens/`. Tokens are imported via `src/styles/sol-tokens.css` which re-exports from the package. Before using a token, verify it exists:

```bash
grep "sol-my-token-name" C:/Users/anjsonawane/sol-tokens/sol-tokens-v1-with-v2-values.css
```

**SCSS → CSS conversion:**

1. SCSS variables → `--sol-*` CSS custom properties (never hardcode `#hex`, `px`, `rem` values that have a token)
2. SCSS `@mixin` → Expand to flat CSS rules
3. SCSS `@each` → Expand all iterations into explicit rules
4. `sol-*` Angular element selectors → class selectors (e.g. `sol-dropdown` → `.sol-dropdown`)
5. Keep all class names **identical** to Angular source (e.g. `.sol-button`, `.sol-dropdown-trigger`)
6. `:host` → wrapper element class or component root class
7. Vue/Svelte: embed all styles inside `<style>` block; use `:global(.sol-foo)` to prevent scoping

**Use semantic tokens — never base tokens:**

| Category | Tokens in use across this project |
| -------- | --------------------------------- |
| Text | `--sol-color-text-default` · `--sol-color-text-secondary` · `--sol-color-text-disabled` · `--sol-color-text-placeholder` · `--sol-color-text-error` · `--sol-color-text-on-action-primary` |
| Background | `--sol-color-background-primary` · `--sol-color-background-disabled` · `--sol-color-background-hover` · `--sol-color-background-selected` · `--sol-color-background-surface-overlay` · `--sol-color-background-field-default` |
| Border | `--sol-color-border-default` · `--sol-color-border-strong` · `--sol-color-border-subtle` · `--sol-color-border-focus-default` · `--sol-color-border-status-critical` · `--sol-color-border-state-hover-neutral` |
| Icon | `--sol-color-icon-default` · `--sol-color-icon-disabled` |
| Radius | `--sol-size-radius-sm` · `--sol-size-radius-md` · `--sol-size-radius-round` |
| Spacing | `--sol-size-spacing-3xs` · `--sol-size-spacing-xs` · `--sol-size-spacing-sm` · `--sol-size-spacing-md` |
| Control size | `--sol-size-control-sm` · `--sol-size-control-md` · `--sol-size-control-lg` |
| Border width | `--sol-size-border-default` · `--sol-size-border-medium` · `--sol-size-border-focus` |
| Typography | `--sol-typography-body-md-font-family` · `--sol-typography-body-md-font-size` · `--sol-typography-body-md-line-height` · `--sol-typography-body-sm-font-size` · `--sol-typography-label-md-font-size` |
| Elevation | `--sol-shadow-md` · `--sol-effect-overlayshadow` |

**Strict rules:**
- Do **not** add fallback values: `var(--sol-size-radius-sm)` not `var(--sol-size-radius-sm, 4px)` — fallbacks hide missing tokens
- Do **not** use base tokens like `--sol-base-color-gray-90`; always use semantic aliases above
- Tokens already in the package with the same name flow through automatically — no bridge alias needed

### Storybook Stories Rules

1. Mirror the exact story names from the Angular source (`_stories/*.stories.ts`)
2. Use `Meta<typeof Component>` and `StoryObj<typeof Component>` types
3. Title format: `'Components/<ComponentName>/Examples'`
4. Overview story title: `'Components/<ComponentName>/Overview'` (docs-only)
5. Include all `argTypes` from Angular stories
6. Convert Angular template syntax to JSX in story `render()` functions
7. **After writing component files**, add the framework badge for the new component in `.storybook/manager-head.html` by inserting its `data-item-id` selector into the correct badge group. The `data-item-id` is the story title path lowercased with spaces replaced by hyphens (e.g. `Components/Text Input` → `components-text-input`). Add to the React 18, Next.js, Vue 3, or Svelte 5 section based on `framework`.

### Test Rules

1. Use `vitest` + `@testing-library/react` (already configured)
2. Convert each Jasmine/Karma spec to a `describe`/`it` block
3. Use `screen.getByRole`, `userEvent`, `render` from `@testing-library/react`
4. Import `{ describe, it, expect, vi }` from `vitest`
5. Mock complex dependencies with `vi.fn()` and `vi.mock()`

### MDX Documentation Rules

1. Mirror the Angular `.mdx` file content and structure
2. Use `<Meta title="Components/<Name>/Overview" />`
3. Import stories with `import * as ComponentExamples from '../_stories/Component.stories'`
4. Replace Angular usage examples with React JSX examples
5. Keep all guidelines, design rules, and descriptions from the original

---

## Framework-Specific Conversion Rules

Apply the section matching the `framework` variable from Step 1. The base Conversion Rules above cover React 18. The sections below document **differences only**.

### Next.js

Identical to React 18, with one addition:

**`'use client'` directive** — add `'use client'` as the very first line of any component file that uses:

- `useState`, `useReducer`, `useEffect`, `useRef`, or any other hook
- Event handler props (`onClick`, `onChange`, `onFocus`, etc.)
- `forwardRef` with an imperative handle
- Browser-only APIs (`window`, `document`, `localStorage`, etc.)

Omit `'use client'` for props-only components with no hooks and no event handlers — these become React Server Components automatically.

**Build command:** use `npm run build` unless `next.config.*` exists at the repo root, in which case use `next build`.

---

### Vue 3 (Composition API)

**Component syntax — `.vue` Single File Component:**

```vue
<script setup lang="ts">
// imports, defineProps, defineEmits, refs, computed, effects
</script>

<template>
  <!-- template content -->
</template>

<style>
/* CSS — same --sol-* custom properties, same class names */
</style>
```

**Angular → Vue 3 mapping:**

- `input<T>(default)` → `const props = defineProps<{ prop?: T }>()`
- `output<T>()` → `const emit = defineEmits<{ event: [val: T] }>()`
- `@HostBinding('class.foo')` → `:class="{ foo: condition }"` on root element
- `@ViewChild` / `viewChild()` → `const el = useTemplateRef('el')`
- `ng-content` → `<slot />`
- Named `ng-content select="[x]"` → `<slot name="x" />`
- `*ngIf` / `@if` → `v-if` / `v-else`
- `*ngFor` / `@for` → `v-for="item in items" :key="item.id"`
- `[class.foo]="cond"` → `:class="{ foo: cond }"`
- `(click)="handler($event)"` → `@click="handler"`
- `@HostListener` → `onMounted` + `addEventListener`
- Angular `EventEmitter` → `emit('eventName', payload)`
- `useId()` → `useId()` from `vue` (Vue 3.5+)

**CSS:** styles go inside the `<style>` block in the `.vue` file — no separate `.css` file.

**Tests:** use `@testing-library/vue` with `vitest`. Replace `render` import from `@testing-library/react` with `@testing-library/vue`.

**Stories:** use `@storybook/vue3-vite`. `Meta` and `StoryObj` import from `@storybook/vue3`.

---

### Svelte 5 (Runes)

**Component syntax — `.svelte` file:**

```svelte
<script lang="ts">
  // $props, $state, $derived, $effect
</script>

<!-- template content -->

<style>
  /* CSS — same --sol-* custom properties */
  /* Svelte scopes styles by default; use :global(.sol-foo) to keep Angular class names unscoped */
</style>
```

**Angular → Svelte 5 mapping:**

- `input<T>(default)` → `let { prop = default }: { prop?: T } = $props()`
- `output<T>()` → `let { onEvent }: { onEvent?: (v: T) => void } = $props()`
- `@HostBinding` → `class` / `id` attributes on root element
- `@ViewChild` → `let el: HTMLElement` + `bind:this={el}`
- `ng-content` → `{@render children?.()}`
- `*ngIf` / `@if` → `{#if condition}...{/if}`
- `*ngFor` / `@for` → `{#each items as item (item.id)}...{/each}`
- `[class.foo]="cond"` → `class:foo={cond}`
- `(click)="handler($event)"` → `onclick={handler}`
- `@HostListener` → `$effect` + `addEventListener`
- Angular `EventEmitter` → callback prop: `onEvent?.(payload)`
- `useState` / Angular signal → `let value = $state(initial)`
- `useMemo` / `computed` → `let derived = $derived(expression)`
- `useEffect` / `ngOnInit` → `$effect(() => { ... })`

**CSS:** styles go inside the `<style>` block — no separate `.css` file. Wrap Angular class selectors with `:global()` to prevent Svelte from scoping them (e.g., `:global(.sol-button) { }`).

**Tests:** use `@testing-library/svelte` with `vitest`. Requires `@sveltejs/vite-plugin-svelte` in `vite.config.ts`.

**Stories:** use `@storybook/svelte-vite`. `Meta` and `StoryObj` import from `@storybook/svelte`.

**Build validation:** use `npm run check` (runs `svelte-check`) instead of `npm run build`.

---

## Step-by-Step Execution

When the user runs `/migrate-component <name>`:

### Step 1 — Resolve component name, target framework, and clone source repo

**Resolve variables:**

- `kebabName` = `<name>` as-is (e.g., `text-input`)
- `PascalName` = PascalCase (e.g., `TextInput`)
- `sourceRepo` = `https://github.com/nice-cxone/sol-components`

**Derive all paths dynamically** — never hardcode usernames or machine-specific directories:

```bash
# Root of the React target repo (where this command runs)
TARGET_REPO_DIR=$(git rev-parse --show-toplevel)

# Source repo cloned as a sibling of the target repo
SOURCE_CLONE_DIR="$(dirname "$TARGET_REPO_DIR")/sol-components"

# Component source path inside the clone
LOCAL_SOURCE_PATH="$SOURCE_CLONE_DIR/projects/ds-components/<kebabName>/src/lib"
```

**Clone or update the source repo:**

```bash
if [ -d "$SOURCE_CLONE_DIR/.git" ]; then
  # Repo already cloned — pull latest
  git -C "$SOURCE_CLONE_DIR" pull --ff-only origin main 2>/dev/null \
    || echo "Warning: pull failed — proceeding with existing local clone"
else
  # First time on this machine — clone the source repo
  git clone https://github.com/nice-cxone/sol-components.git "$SOURCE_CLONE_DIR"
fi
```

- Pull succeeds → source files are up to date. Proceed.
- Pull fails (no network, expired token) → log a warning and proceed with the existing clone.
- Clone fails → stop immediately. Ask the user to check their git credentials or network access.

**Resolve `--target` flag into framework variables:**

| `--target` value | `framework` | `fileExt` | `testExt` | `storiesExt` | `buildCmd` | `testCmd` |
| --- | --- | --- | --- | --- | --- | --- |
| _(omitted)_ / `react` / `next.js` / `nextjs` | `react` or `nextjs` | `.tsx` | `.test.tsx` | `.stories.tsx` | `npm run build` | `npm run test` |
| `vue` | `vue` | `.vue` | `.test.ts` | `.stories.ts` | `npm run build` | `npm run test` |
| `svelte` | `svelte` | `.svelte` | `.test.ts` | `.stories.ts` | `npm run check` | `npm run test` |

Use these variables in all subsequent steps wherever file extensions or commands are referenced.

### Step 2 — Read ALL source files

> **Source rule:** ALL source files are read from the local clone at `$SOURCE_CLONE_DIR`. Use standard filesystem tools — the Read tool (preferred), `ls`, or `cat`. No GitHub API calls, no `gh` CLI, no `curl`.

**Discover files** by listing all directories in parallel:

```bash
ls "$LOCAL_SOURCE_PATH/"
ls "$LOCAL_SOURCE_PATH/_docs/"     2>/dev/null   # skip if absent
ls "$LOCAL_SOURCE_PATH/_stories/"  2>/dev/null   # skip if absent
ls "$LOCAL_SOURCE_PATH/enum/"      2>/dev/null   # skip if absent
```

Also check for nested subdirectories (e.g. `components/`, `interfaces/`, `configurator/`) — list them too if they exist.

**Read each file's content** using the Read tool or `cat`:

```bash
# Preferred — Read tool with absolute path:
# Read: $LOCAL_SOURCE_PATH/<filename>

# Alternative:
cat "$LOCAL_SOURCE_PATH/<filename>"
```

File types to read:

- TypeScript (`.ts`)
- HTML template (`.html`)
- SCSS (`.scss`)
- Stories (`.stories.ts`)
- Specs (`.spec.ts`)
- MDX docs (`.mdx`)
- Enums (`enum/`)

> **Performance:** Issue all directory listing calls at once. Once the file lists are returned, read all individual file contents in parallel. Do not wait for one file to complete before starting the next.

### Step 3 — Print analysis report

After reading all source files, print a report with these fields before writing any React code, then **immediately continue to Step 3b** — do not wait for user input.

- **Header:** `ANALYSIS REPORT — <ComponentName> [target: <framework>]`
- **Source files discovered:** total count across `lib/`, `_docs/`, `_stories/`
- **Components:** each component/sub-component with its selector and whether it is primary or sub
- **Props:** Angular input → framework prop, type, default
- **Events:** Angular output → framework callback, payload type
- **Angular dependencies to convert:** Angular dep → framework equivalent + notes
- **Files to create:** Angular source → framework target (one row per file; mark modules/ng-package as N/A)
- **Story count:** Angular story file → React file, story count per file (must match 1-to-1)
- **Footer:** `READY TO GENERATE: <total> <framework> files`

Omit any section that has no entries.

### Step 3b — Analyze and convert

Apply all Conversion Rules above. Pay special attention to:

- All `input()` signals → React props
- All `output()` signals → React callback props
- Template control flow (`@if`, `@for`, `@switch`) → JSX expressions
- `ng-content` → `children` prop
- SCSS compiled output → CSS with custom properties

### Step 4 — Sync package.json with Angular source

Before writing any component files, read the React target `package.json`. If **all four** required packages below are already present (in any version), **skip this step entirely** — do not fetch the Angular source `package.json`. Only proceed with the sync when at least one package is missing.

#### Required packages (always check these)

| Package | Location in React target | Reason |
| --- | --- | --- |
| `@niceltd/sol-tokens` | `dependencies` | CSS custom property tokens — consumers need this at runtime |
| `@niceltd/cxone-playwright-test-utils` | `devDependencies` | Playwright E2E utilities — needed for page-object corral scripts |
| `@niceltd/eslint-config-cxone` | `devDependencies` | Shared internal ESLint config — consistent linting rules |
| `@niceltd/cxone-client-platform-services` | `devDependencies` | Platform services used by some components and Storybook stories |

#### How to sync

1. Fetch `https://raw.githubusercontent.com/nice-cxone/sol-components/main/package.json` (Angular source).
2. Read `package.json` in this repo (React target).
3. For every `@niceltd/*` package in the Angular source, check if it already exists in the React target.
4. If missing — add it under the correct section (`dependencies` or `devDependencies`) using the **exact same version string** as the Angular source.
5. If the version specifier differs (e.g. `github:` reference vs semver) — update it to match the Angular source.

> **Note:** All `@niceltd/*` packages are hosted on the private AWS CodeArtifact registry. They cannot be installed until the registry token is configured (see registry setup below). Add them to `package.json` now so the lockfile stays accurate — actual `npm install` happens at the end.

### Step 4b — Design Tokens & Styling

#### Registry setup (do this first)

The SOL token package is private and hosted on **AWS CodeArtifact**, not the public npm registry.

1. Check the user's global `~/.npmrc` for the registry URL — it will look like:

   ```text
   registry=https://nice-devops-<id>.d.codeartifact.<region>.amazonaws.com/npm/<feed>/
   //<host>/:_authToken=<token>
   ```

2. Set the project `.npmrc` to inherit from global (do NOT override with `registry=https://registry.npmjs.org/`):

   ```ini
   strict-ssl=false
   ```

3. If the CodeArtifact token is expired (they last 12 hours), ask the user to refresh it:

   ```bash
   aws codeartifact login --tool npm --domain nice-devops --domain-owner <account-id> --region <region> --repository <feed>
   ```

#### Adding the token dependency

Add to `package.json` as a runtime dependency (not devDependency — consumers need it):

```json
"dependencies": {
  "@niceltd/sol-tokens": "<version>"
}
```

Check the Angular repo's `package.json` for the correct version.

#### tokens.css — import from package, bridge-alias old names

`src/tokens/tokens.css` must import the real package first, then define bridge aliases
for any React-local token names that differ from the Angular names:

```css
@import '@niceltd/sol-tokens/sol-tokens.css';

:root {
  /* Bridge aliases — map React component CSS names to Angular token names */
  /* Remove each alias once the component CSS is updated to use Angular names directly */
  --sol-font-family-base: var(--sol-typography-body-md-font-family);
  --sol-font-size-sm:     var(--sol-typography-body-sm-font-size);
  --sol-font-size-md:     var(--sol-typography-body-md-font-size);
  --sol-font-size-lg:     var(--sol-typography-body-lg-font-size);
  /* ... etc */
}
```

Do NOT hardcode raw values (`#hex`, `rem`) for tokens that exist in the package.
Tokens with no package equivalent (z-index, transitions, component-specific heights) may remain hardcoded.

#### Loading tokens into the page

Tokens must be imported in **two places** so they are available in all contexts:

1. **Library entry** `src/index.ts` — so consumers get tokens automatically:

   ```ts
   import './tokens/tokens.css';
   ```

2. **Storybook preview** `.storybook/preview.ts` — Storybook does not go through `index.ts`:

   ```ts
   /// <reference types="vite/client" />
   import '../src/tokens/tokens.css';
   ```

Also add `src/vite-env.d.ts` so TypeScript accepts CSS side-effect imports:

```ts
/// <reference types="vite/client" />
```

---

### Step 5 — Pre-flight check

Before writing any files, verify the working tree is clean so a rollback is safe:

```bash
git status --short
```

- If the output is **empty** → proceed.
- If there are **uncommitted changes** → stop immediately and print:

```text
MIGRATION ABORTED — dirty working tree
  The repository has uncommitted changes. Commit or stash them before migrating.
  Run `git status` to see what is modified.
```

Record the pre-migration state for rollback:

```bash
# Snapshot which files currently exist in src/index.ts (used to restore on rollback)
git stash list   # just for reference; do not stash
```

> **Failure rule (applies to Steps 6–9):** If anything fails for any reason after this point — file write error, TypeScript error, test failure, git error — execute the Rollback Procedure immediately, print the Migration Failure Report, and stop. Do not commit partial work under any circumstances.

#### Rollback Procedure

Run these three commands in order whenever any failure occurs after Step 5:

```bash
rm -rf src/components/<PascalName>/
git checkout src/index.ts
git status --short
```

Expected result: empty output from `git status --short`. If the working tree is still dirty after rollback, list every remaining file and ask the user to resolve manually.

---

### Step 6 — Write target files

Create all files in `src/components/<PascalName>/`. The exact set of files depends on what exists in the Angular source — use the tree below as a template and add/remove files to match the source 1-to-1.

> **Framework note:** Replace `.tsx` with `fileExt` resolved in Step 1 (`.tsx` for react/nextjs, `.vue` for vue, `.svelte` for svelte). For Vue and Svelte, styles are embedded in the component file — **do not create a separate `.css` file**. Test files use `testExt`; story files use `storiesExt`.

```text
src/components/<PascalName>/
├── <PascalName><fileExt>                          ← primary component
├── <SubComponentName><fileExt>                    ← one per sub-component (if any)
├── <PascalName>.css                               ← React/Next.js only; Vue/Svelte embed styles
├── <PascalName><testExt>                          ← covers all specs (primary + sub)
├── index.ts                                       ← barrel export for everything
├── _e2e/
│   └── <PascalName>.page.ts                      ← only if .page.ts exists in source
├── _stories/
│   ├── <PascalName><storiesExt>                  ← one per Angular .stories.ts
│   ├── <PascalName>Overview<storiesExt>          ← from overview-*.stories.ts
│   ├── <SubComponentName><storiesExt>            ← from *-group.stories.ts (if exists)
│   ├── <PascalName>Forms<storiesExt>             ← from *-reactive-forms.stories.ts (if exists)
│   └── <SubComponentName>Forms<storiesExt>       ← from *-group-forms.stories.ts (if exists)
└── _docs/
    ├── <PascalName>.mdx                          ← from *-overview.mdx
    ├── <PascalName>Api.mdx                       ← from *-api.mdx
    ├── <PascalName>Migration.mdx                 ← from *-migrate-from-*.mdx
    ├── <SubComponentName>.mdx                    ← from *-group-overview.mdx (if exists)
    └── <SubComponentName>Api.mdx                 ← from *-group-api.mdx (if exists)
```

If any file write fails mid-way, run the Rollback Procedure and print the Migration Failure Report before stopping.

### Step 7 — Update barrel export

In `src/index.ts`, add:

```typescript
export { <PascalName> } from './components/<PascalName>';
export type { <PascalName>Props } from './components/<PascalName>';
```

If editing `src/index.ts` fails, run the Rollback Procedure and print the Migration Failure Report before stopping.

### Step 8 — Validate (build + tests)

**Phase 1 — TypeScript build (ALWAYS runs — cannot be skipped):**

```bash
<buildCmd>   # npm run build (react/nextjs/vue) or npm run check (svelte)
```

If build fails → run Rollback Procedure + print Migration Failure Report. Stop.

**Phase 2 — Component-scoped tests (skipped only if `--no-validate`):**

```bash
npx vitest run <PascalName>
```

Run only the newly migrated component's test file. Completes in ~5 seconds regardless of how many other components exist in the repo. If these tests fail → run Rollback Procedure + print Migration Failure Report. Stop.

**Phase 3 — Full suite (only if `--full-test` flag was passed):**

```bash
<testCmd>
```

Run the entire test suite to check for regressions across all components. After it completes, print the full suite report:

```text
FULL SUITE REPORT
  Total test files : <N>
  Passed           : <N>
  Failed           : <N>  (list each failing test file and test name)
  Duration         : <Xs>

  <PascalName> component : <N>/<N> passed ✅  (or ❌ with details)
```

If any tests fail → run Rollback Procedure + print Migration Failure Report. Stop.

Only proceed to Step 9 when all phases that ran exit with code 0.

#### Migration Failure Report

Print this for **every failure** in Steps 6–9. Fill all fields with actual values — no placeholders.

```text
MIGRATION FAILED — <PascalName> [target: <framework>]
  Step that failed : <Step 6 – File write | Step 7 – Barrel | Step 8 – Build | Step 8 – Tests | Step 9 – Git>
  Command / action : <exact command or "write <filename>">
  Error details    : <full untruncated output — every TS error code+line, every failing test name, full git stderr>
  Root cause       : <1–2 sentences why it failed>
  Files written    : <list each file written before failure, or "(none)">
  Rollback result  : <✅/❌ for each: component dir deleted · index.ts restored · working tree clean>
  Next steps       : <specific actionable fix + re-run command>
```

Only proceed to Step 9 when all phases that ran exit with code 0.

### Step 9 — Commit and push

```bash
cd /c/Users/anjsonawane/angular-to-react-claudeagent
git add src/components/<PascalName>/ src/index.ts
git commit -m "feat(<kebabName>): migrate Angular SOL <PascalName> to <framework>"
git push origin main
```

If `git commit` or `git push` fails, run the Rollback Procedure and print the Migration Failure Report with `Step 9 – Git` as the failed step. Common causes and their fixes:

- **push rejected (non-fast-forward)** → run `git pull --rebase origin main` then retry the push
- **commit hook failure** → fix the hook error reported, then re-stage and retry the commit
- **authentication error** → ask the user to check their git credentials, then retry

---

## Quality Checklist

Before committing, verify:

### Components

- [ ] TypeScript compiles cleanly (`npm run build`)
- [ ] All Angular `input()` signals mapped to React props with correct types
- [ ] All Angular `output()` signals mapped to callback props
- [ ] `ng-content` → `children` (or named slots → render props)
- [ ] Sub-components (e.g. `*Group`) created as separate `.tsx` files
- [ ] No Angular-specific imports remain in React files

### Styles

- [ ] SCSS class names preserved identically in CSS
- [ ] CSS uses `--sol-*` custom properties (no hardcoded hex/rem values)
- [ ] All SCSS `@mixin` / `@each` blocks expanded to flat CSS rules

### Stories

- [ ] Same number of `.stories.tsx` files as Angular `.stories.ts` files
- [ ] Every Angular story name has a matching React story export
- [ ] Sub-component stories in their own file (e.g. `CheckboxGroup.stories.tsx`)
- [ ] Forms stories converted to React controlled-component pattern

### Docs

- [ ] Same number of `.mdx` files as Angular `.mdx` files
- [ ] Sub-component overview + API docs created as separate files (e.g. `CheckboxGroup.mdx`, `CheckboxGroupApi.mdx`)
- [ ] Migration guide covers Angular → React prop mapping

### Tests & Exports

- [ ] Tests cover the same scenarios as all Angular spec files
- [ ] `src/index.ts` updated with exports for all components and types
- [ ] Page object created in `_e2e/` if `.page.ts` existed in source

---

## Example: Running the Agent

```text
/migrate-component checkbox --target next.js

Step 1  kebabName=checkbox  PascalName=Checkbox  framework=nextjs  fileExt=.tsx
        SOURCE_CLONE_DIR=$(dirname $(git rev-parse --show-toplevel))/sol-components
        git pull → up to date (or cloned fresh)
Step 2  ls $LOCAL_SOURCE_PATH: lib/ _docs/ _stories/ (parallel) → 21 files discovered and read in parallel
Step 3  Analysis report printed → proceed immediately
Step 4  package.json: all 4 @niceltd/* packages present → skipped
Step 4b tokens.css: @niceltd/sol-tokens already imported → no changes needed
Step 5  git status --short → clean → proceed
Step 6  Write 16 files to src/components/Checkbox/
Step 7  src/index.ts updated
Step 8  npm run build ✅  |  npx vitest run Checkbox ✅ (32 passed)
Step 9  git commit + push → feat(checkbox): migrate Angular SOL Checkbox to nextjs
Post    Migration report printed → 100% coverage ✅  |  Total time: 8m 36s
```

See Steps 1–9 above for full details on each phase.

---

## Post-migration verification report

After committing, print this report. Replace all example values with real data. Omit any section with no entries.

### How to produce the report

1. Record `startTime` at Step 1 start and `endTime` just before printing. Break down time per phase (read, write, build, test).
2. List all files in `$LOCAL_SOURCE_PATH` recursively and all files generated under `src/components/<PascalName>/`.
3. Map each Angular source file to its React target (Step 6 rules). Mark Angular-only files (modules, validators, ng-package) as N/A.
4. Compute the **AI Automation Score** (see formula below).
5. Print the report.

### AI Automation Score

Measures how much of the migration was completed automatically without human intervention.

```text
File coverage  = files_generated / files_expected × 100      (weight 40%)
Build health   = 100 if clean build, else 0                  (weight 35%)
Test health    = tests_passed / tests_total × 100            (weight 25%)

AI Score = (file_coverage × 0.40) + (build_health × 0.35) + (test_health × 0.25)
```

| Score | Label |
| --- | --- |
| 90–100% | Fully automated ✅ |
| 70–89% | Mostly automated — minor review needed ⚠️ |
| Below 70% | Manual fixes required ❌ |

### Output format

Print the report as markdown tables so it renders clearly in the terminal and in Storybook/GitHub.

---

## MIGRATION REPORT — `<PascalName>` · `<framework>` · `<date>`

| | |
| --- | --- |
| Source | `sol-components/projects/ds-components/<kebabName>/src/lib/` |
| Target | `src/components/<PascalName>/` |
| Commit | `feat(<kebabName>): migrate Angular SOL <PascalName> to <framework>` |
| Duration | `<total>`  (read `<t>s` · write `<t>s` · build `<t>s` · test `<t>s`) |

---

### AI Automation Score: `<N>%` — `<label>`

| Metric | Result | Score | Weight |
| --- | --- | --- | --- |
| File coverage | `<generated>/<expected>` files | `<N>%` | ×0.40 |
| Build health | ✅ clean — 0 errors / ❌ `<N>` errors | `100 / 0` | ×0.35 |
| Test health | `<passed>/<total>` passed | `<N>%` | ×0.25 |
| **AI Score** | | **`<N>%`** | |

---

### File Mapping

| Category | Angular Source | React Target | Status |
| --- | --- | --- | --- |
| Component | `checkbox.component.ts / .html` | `Checkbox.tsx` | ✅ |
| Styles | `checkbox.component.scss` | `Checkbox.css` | ✅ |
| Sub-comp | `checkbox-group.component.ts` | `CheckboxGroup.tsx` | ✅ |
| Types | `checkbox.types.ts` | `Checkbox.tsx` (inline) | ✅ |
| Tests | `checkbox.component.spec.ts` | `Checkbox.test.tsx` | ✅ |
| E2E | `checkbox.page.ts` | `_e2e/Checkbox.page.ts` | ✅ |
| Story | `_stories/checkbox.stories.ts` | `_stories/Checkbox.stories.tsx` | ✅ |
| Story | `_stories/overview-checkbox.stories.ts` | `_stories/CheckboxOverview.stories.tsx` | ✅ |
| Docs | `_docs/checkbox-overview.mdx` | `_docs/Checkbox.mdx` | ✅ |
| Docs | `_docs/checkbox-api.mdx` | `_docs/CheckboxApi.mdx` | ✅ |
| Barrel | `public_api.ts` | `index.ts` | ✅ |
| N/A | `checkbox.module.ts` | — (Angular module, not ported) | ⬜ |
| N/A | `ng-package.json` | — (Angular build config) | ⬜ |

---

### Story Count

| Angular File | React File | Stories | Match |
| --- | --- | --- | --- |
| `checkbox.stories.ts` | `Checkbox.stories.tsx` | 1 | ✅ |
| `checkbox-group.stories.ts` | `CheckboxGroup.stories.tsx` | 2 | ✅ |
| `checkbox-reactive-forms.stories.ts` | `CheckboxForms.stories.tsx` | 1 | ✅ |
| `overview-checkbox.stories.ts` | `CheckboxOverview.stories.tsx` | 9 | ✅ |

---

### Summary

| Metric | Value |
| --- | --- |
| Angular source files | `<N>` total (`<N>` ported · `<N>` N/A · `<N>` Angular-only) |
| React files generated | `<N>` (`<N>` components · `<N>` CSS · `<N>` tests · `<N>` stories · `<N>` docs · `<N>` e2e · 1 barrel) |
| Missing files | `<N>` |
| Build | ✅ clean / ❌ failed |
| Tests | `<passed>/<total>` passed |
| AI Score | `<N>%` — `<label>` |

---

> ❌ **ACTION REQUIRED — `<N>` missing files** _(omit this section if missing = 0)_
>
> | Expected File | Missing From |
> | --- | --- |
> | `_docs/CheckboxGroup.mdx` | `checkbox-group-overview.mdx` |
> | `_stories/CheckboxGroupForms.stories.tsx` | `checkbox-group-forms.stories.ts` |
