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

Given a component name (e.g. `checkbox`), this agent will:

1. **Read all source files** from the Angular source repo on GitHub:
   `https://github.com/nice-cxone/sol-components/tree/main/projects/ds-components/<component-name>/src/lib/`

2. **Analyze** the Angular component — read **every** file in the source directory:
   - `*.component.ts` — inputs, outputs, logic (primary component)
   - `*.component.html` — template structure
   - `*.component.scss` — styles (converted to CSS custom properties)
   - `*.module.ts` — imports/dependencies (not ported, but used to discover sub-components)
   - `enum/*.enum.ts` — TypeScript enums
   - `_docs/*.mdx` — **all** documentation files (there may be more than one per sub-component)
   - `_stories/*.stories.ts` — **all** story files (there may be 3–5)
   - `*.spec.ts` — unit tests (there may be one per sub-component)
   - `*.types.ts` — shared types and enums
   - `*.page.ts` — Playwright page objects (E2E test utilities)
   - `*-group.component.ts` etc. — **sub-components** (e.g. `CheckboxGroup`, `ChipGroup`, `RadioGroup`) that live alongside the primary component

3. **Generate React equivalents** in `src/components/<ComponentName>/`.

   **Primary component files (always created):**

   - `<ComponentName>.tsx` — React component (TypeScript, forwardRef where needed)
   - `<ComponentName>.css` — CSS (Angular SCSS → CSS custom properties, same class names)
   - `<ComponentName>.test.tsx` — Vitest + @testing-library/react tests
   - `index.ts` — barrel export for all components and types in this directory

   **Sub-component files (create for each companion component found in source):**

   - `<SubComponentName>.tsx` — React sub-component (e.g. `CheckboxGroup.tsx`)
   - Tests go into the primary `<ComponentName>.test.tsx` (or a separate `<SubComponentName>.test.tsx` if the spec file is large)

   **Storybook stories — one file per Angular story file:**

   - `_stories/<ComponentName>.stories.tsx` ← from `<component>.stories.ts`
   - `_stories/<ComponentName>Overview.stories.tsx` ← from `overview-<component>.stories.ts`
   - `_stories/<SubComponentName>.stories.tsx` ← from `<component>-group.stories.ts` (if exists)
   - `_stories/<ComponentName>Forms.stories.tsx` ← from `<component>-reactive-forms.stories.ts` or `<component>-forms.stories.ts` (if exists); show React controlled-component / React Hook Form equivalents
   - `_stories/<SubComponentName>Forms.stories.tsx` ← from `<component>-group-forms.stories.ts` (if exists)

   > **Rule:** count the Angular story files and produce the same number of React story files, one-to-one.

   **Docs — one file per Angular MDX doc:**

   - `_docs/<ComponentName>.mdx` ← from `<component>-overview.mdx`
   - `_docs/<ComponentName>Api.mdx` ← from `<component>-api.mdx`
   - `_docs/<ComponentName>Migration.mdx` ← from `<component>-migrate-from-*.mdx`
   - `_docs/<SubComponentName>.mdx` ← from `<component>-group-overview.mdx` (if exists)
   - `_docs/<SubComponentName>Api.mdx` ← from `<component>-group-api.mdx` (if exists)

   > **Rule:** count the Angular MDX files and produce the same number of React MDX files, one-to-one.

   **Page objects (optional — create only when `.page.ts` exists in source):**

   - `_e2e/<ComponentName>.page.ts` — Playwright page-object selectors (CSS class names stay the same as Angular)

4. **Update** `src/index.ts` to export the new component.

5. **Commit and push** all changes to the target GitHub repo.

---

## Conversion Rules

### Angular → React Mapping

| Angular | React |
|---------|-------|
| `@Component({ selector: 'sol-foo' })` | `export const Foo: React.FC<FooProps>` |
| `input<T>(default)` | `prop?: T` in interface |
| `output<T>()` | `onEvent?: (val: T) => void` |
| `@HostBinding` | inline `className`, `id`, etc. |
| `@ViewChild` / `viewChild()` | `useRef()` |
| `ChangeDetectionStrategy.OnPush` | React's default (re-render on prop/state change) |
| `ViewEncapsulation.None` | Plain CSS (no scoping) |
| `ng-content` | `children: React.ReactNode` |
| `ngModel` / `ControlValueAccessor` | controlled component pattern |
| `@Optional() @Self()` | not needed, pass as props |
| Angular `*ngIf` | `{condition && <Element />}` |
| Angular `*ngFor` | `{array.map(item => <Element />)}` |
| Angular `[class.foo]="cond"` | `className={cond ? 'foo' : ''}` |
| `(click)="handler($event)"` | `onClick={handler}` |
| `@HostListener` | `useEffect` + `addEventListener` |
| Angular `EventEmitter` | callback prop function |
| `@Input() disabled = false` | `disabled?: boolean` |
| Angular Material components | headless React equivalents using CSS |
| AG Grid Angular | `ag-grid-react` (`AgGridReact`) |
| `ngx-toastr` | `react-toastify` |
| `tippy.js` | `tippy.js` (same, framework-agnostic) |
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

- `button` → `Button`
- `text-input` → `TextInput`
- `radio-button` → `RadioButton`
- `check-box` → `Checkbox`
- `chip-group` → `ChipGroup`
- `date-picker` → `DatePicker`
- etc. (kebab-case → PascalCase)

### CSS Conversion Rules

1. **SCSS variables** → CSS custom properties (`--sol-*` design tokens)
2. **SCSS `@mixin`** → Keep the compiled output as flat CSS rules
3. **SCSS `@each`** → Expand all iterations into explicit CSS rules
4. **`sol-*` Angular element selectors** → Equivalent class selectors (`.sol-icon`)
5. **Keep all class names identical** to Angular source (e.g., `.sol-button`, `.btn-primary-large`)
6. **`:host` selector** → Wrapper element class or direct component root class

### Storybook Stories Rules

1. Mirror the exact story names from the Angular source (`_stories/*.stories.ts`)
2. Use `Meta<typeof Component>` and `StoryObj<typeof Component>` types
3. Title format: `'Components/<ComponentName>/Examples'`
4. Overview story title: `'Components/<ComponentName>/Overview'` (docs-only)
5. Include all `argTypes` from Angular stories
6. Convert Angular template syntax to JSX in story `render()` functions

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

Apply the section that matches the `framework` variable resolved in Step 1. React rules are the default and already covered by the Conversion Rules section above — the sections below document only the **differences**.

### React 18

No changes — apply the Conversion Rules section above as-is.

---

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

### Step 1 — Resolve component name and target framework

Convert `<name>` to:

- `kebabName` = `<name>` as-is (e.g., `text-input`)
- `PascalName` = PascalCase (e.g., `TextInput`)
- `sourceRepo` = `https://github.com/nice-cxone/sol-components`
- `sourcePath` = `projects/ds-components/<kebabName>/src/lib` (path within the repo)
- `ghApiBase` = `repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib` (used with `gh api <ghApiBase>`)
- `targetPath` = `src/components/<PascalName>/`

**Resolve `--target` flag into framework variables:**

| `--target` value      | `framework` | `fileExt`  | `testExt`    | `storiesExt`    | `buildCmd`      | `testCmd`      |
| --------------------- | ----------- | ---------- | ------------ | --------------- | --------------- | -------------- |
| _(omitted)_           | `react`     | `.tsx`     | `.test.tsx`  | `.stories.tsx`  | `npm run build` | `npm run test` |
| `react`               | `react`     | `.tsx`     | `.test.tsx`  | `.stories.tsx`  | `npm run build` | `npm run test` |
| `next.js` / `nextjs`  | `nextjs`    | `.tsx`     | `.test.tsx`  | `.stories.tsx`  | `npm run build` | `npm run test` |
| `vue`                 | `vue`       | `.vue`     | `.test.ts`   | `.stories.ts`   | `npm run build` | `npm run test` |
| `svelte`              | `svelte`    | `.svelte`  | `.test.ts`   | `.stories.ts`   | `npm run check` | `npm run test` |

Use these variables in all subsequent steps wherever file extensions or commands are referenced.

### Step 2 — Read ALL source files

> **Source rule:** ALL source files must be fetched from `https://github.com/nice-cxone/sol-components`. Never read from the local filesystem. Use `gh api` (authenticated gh CLI) for all GitHub access — it works for private repos and avoids unauthenticated 404 errors.

**Discover files** using `gh api` in parallel for all four directories:

```bash
gh api repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib --jq '.[].name'
gh api repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib/_docs --jq '.[].name'
gh api repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib/_stories --jq '.[].name'
gh api repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib/enum --jq '.[].name'  # skip if 404
```

**Read each file's content** using `gh api` with base64 decode:

```bash
gh api repos/nice-cxone/sol-components/contents/projects/ds-components/<kebabName>/src/lib/<filename> --jq '.content' | base64 -d
```

File types to fetch:

- TypeScript (`.ts`)
- HTML template (`.html`)
- SCSS (`.scss`)
- Stories (`.stories.ts`)
- Specs (`.spec.ts`)
- MDX docs (`.mdx`)
- Enums (`enum/`)

> **Performance:** Run all `gh api` calls **in parallel** — issue every fetch concurrently. Do not wait for one file to finish before starting the next.

### Step 3 — Print analysis report

After reading all source files, **print the following report in full before writing any React code**. This lets the user review and confirm the migration plan before any files are created.

```text
ANALYSIS REPORT — <ComponentName>  [target: <framework>]
Source : github.com/nice-cxone/sol-components → projects/ds-components/<kebabName>/src/lib/

SOURCE FILES DISCOVERED
  <count> files found across lib/, _docs/, _stories/

COMPONENTS
  | Component         | Selector               | Sub-component? |
  | ----------------- | ---------------------- | -------------- |
  | <ComponentName>   | sol-<kebab-name>       | No (primary)   |
  | <SubComponent>    | sol-<kebab-sub>        | Yes            |

PROPS (Inputs)
  | Angular @Input / signal  | <framework> prop | Type            | Default  |
  | ------------------------ | ---------------- | --------------- | -------- |
  | showActionBar            | showActionBar    | boolean         | false    |
  | actionBarTextContent     | actionBarText…   | string          | '…'      |
  | ...                      | ...              | ...             | ...      |

EVENTS (Outputs)
  | Angular @Output          | <framework> callback | Payload     |
  | ------------------------ | -------------------- | ----------- |
  | buttonClicked            | onButtonClicked      | void        |
  | ...                      | ...                  | ...         |

ANGULAR DEPENDENCIES TO CONVERT
  | Angular dependency       | <framework> equivalent      | Notes                     |
  | ------------------------ | --------------------------- | ------------------------- |
  | MatExpansionModule       | headless CSS + state        | No Material equivalent    |
  | solTooltip directive     | tippy.js (useEffect)        | Already in dependencies   |
  | sol-button               | <Button> from our library   | Import from components/   |
  | _IdGenerator + NgZone    | useId() / built-in          | Framework built-in        |
  | ResizeObserver           | useEffect + useRef          | Same native API           |
  | ...                      | ...                         | ...                       |

FILES TO CREATE
  | Angular source                      | <framework> target                        |
  | ----------------------------------- | ----------------------------------------- |
  | component.ts / .html                | <ComponentName><fileExt>                  |
  | component.scss                      | <ComponentName>.css (React/Next.js only)  |
  | component.spec.ts                   | <ComponentName><testExt>                  |
  | component.page.ts                   | _e2e/<ComponentName>.page.ts              |
  | _stories/component.stories.ts       | _stories/<ComponentName><storiesExt>      |
  | _docs/component-overview.mdx        | _docs/<ComponentName>.mdx                 |
  | _docs/component-api.mdx             | _docs/<ComponentName>Api.mdx              |
  | module.ts / ng-package.json         | — (N/A)                                   |

STORY COUNT
  | Angular file               | Count | <framework> file                |
  | -------------------------- | ----- | ------------------------------- |
  | component.stories.ts       |   2   | <ComponentName><storiesExt>     |
  | overview-component.stories |   5   | <ComponentName>Overview<storiesExt> |

READY TO GENERATE: <total> <framework> files
```

Fill every table row with the actual values from the source files. Omit rows/tables that have no entries (e.g. no sub-components → omit the sub-component row). **Always proceed automatically** — print the report and immediately continue to Step 3b without waiting for user input.

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

### Step 5 — Design Tokens & Styling

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

#### Component CSS rules

- Use Angular token names directly where known (e.g. `--sol-size-radius-sm`, `--sol-typography-body-md-font-size`).
- Do **not** include fallback values in `var()` calls — `var(--sol-size-radius-sm)` not `var(--sol-size-radius-sm, 0.25rem)`. Fallbacks hide missing tokens.
- Tokens already defined in the package with the same name (e.g. `--sol-color-text-default`, `--sol-color-background-primary`) do not need a bridge alias — they flow through automatically.

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

Print this report for **every failure** in Steps 6–9, regardless of cause (file write error, TypeScript error, test failure, git error). Fill every field with actual values — do not leave placeholders.

```text
MIGRATION FAILED — <PascalName>  [target: <framework>]
══════════════════════════════════════════════════════════════════

  FAILURE SUMMARY
  ──────────────────────────────────────────────────────────────
  Step that failed  : <Step 6 – File write | Step 7 – Barrel export |
                       Step 8 – Build | Step 8 – Tests | Step 9 – Git>
  Command / action  : <exact command run, or "write <filename>" for file errors>
  Framework target  : <react | nextjs | vue | svelte>
  Component         : <PascalName> (<kebabName>)

  ERROR DETAILS
  ──────────────────────────────────────────────────────────────
  <Paste the full, untruncated error output here.
   TypeScript errors  → list every TS error code and file:line (e.g. TS2345 at Spinner.tsx:14).
   Test failures      → list each failing test name and the assertion that failed.
   Git errors         → include the full stderr output.
   File write errors  → include the filename and OS error.>

  ROOT CAUSE
  ──────────────────────────────────────────────────────────────
  <One or two sentences explaining WHY the failure occurred. Examples:
   "The Angular component imports MatDialogRef which was carried over
    into the React file unchanged — it is not a valid React import."
   "Test asserts data-testid='spinner' but the component renders data-sol-id='spinner'."
   "git push rejected: remote has commits not present locally — needs a pull first.">

  FILES WRITTEN BEFORE FAILURE
  ──────────────────────────────────────────────────────────────
  <List every file that was successfully written before the failure, e.g.:
   - src/components/Spinner/Spinner.tsx
   - src/components/Spinner/Spinner.css
   - src/components/Spinner/index.ts
   (none) — if the failure happened before any file was written>

  ROLLBACK RESULT
  ──────────────────────────────────────────────────────────────
  ✅  src/components/<PascalName>/ deleted
  ✅  src/index.ts restored to pre-migration state
  ✅  Working tree is clean — no partial migration committed
  (Replace ✅ with ❌ and describe what remains if the rollback itself failed)

  NEXT STEPS
  ──────────────────────────────────────────────────────────────
  <Specific, actionable fix instructions based on the root cause. Examples:
   "Remove the MatDialogRef import from Spinner.tsx and replace it with
    a useRef + onClose callback prop, then re-run /migrate-component spinner."
   "Change data-sol-id to data-testid at Spinner.tsx:42, then re-run."
   "Run git pull origin main to sync the branch, then re-run /migrate-component spinner.">

══════════════════════════════════════════════════════════════════
```

Only proceed to Step 9 when **both** commands exit with code 0.

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
User: /migrate-component checkbox

-- Step 1: Resolve names --
kebabName     = checkbox
PascalName    = Checkbox
sourceRepo    = https://github.com/nice-cxone/sol-components
sourcePath    = projects/ds-components/checkbox/src/lib
githubApiBase = https://api.github.com/repos/nice-cxone/sol-components/contents/projects/ds-components/checkbox/src/lib
rawBase       = https://raw.githubusercontent.com/nice-cxone/sol-components/main/projects/ds-components/checkbox/src/lib

-- Step 2: Discover & read ALL source files via GitHub --
Fetches API : https://api.github.com/repos/nice-cxone/sol-components/contents/projects/ds-components/checkbox/src/lib
Fetches API : .../src/lib/_docs
Fetches API : .../src/lib/_stories

Reads (raw) : .../src/lib/checkbox.component.ts              ← primary component
Reads: checkbox.component.html
Reads: checkbox.component.scss
Reads: checkbox-group.component.ts        ← sub-component discovered
Reads: checkbox-group.component.scss
Reads: checkbox.types.ts
Reads: checkbox.module.ts                 ← read to discover sub-components; not ported
Reads: checkbox.component.spec.ts
Reads: checkbox-group.component.spec.ts   ← sub-component spec
Reads: checkbox.page.ts                   ← Playwright page object
Reads: checkbox-group.page.ts
Reads: _stories/checkbox.stories.ts
Reads: _stories/checkbox-group.stories.ts ← separate story file for sub-component
Reads: _stories/checkbox-reactive-forms.stories.ts
Reads: _stories/checkbox-group-forms.stories.ts
Reads: _stories/overview-checkbox.stories.ts
Reads: _docs/checkbox-overview.mdx
Reads: _docs/checkbox-api.mdx
Reads: _docs/checkbox-group-overview.mdx  ← sub-component doc
Reads: _docs/checkbox-group-api.mdx
Reads: _docs/checkbox-migrate-from-breeze.mdx

-- Step 5: Write target files (one React file per Angular file) --
Creates: src/components/Checkbox/Checkbox.tsx
Creates: src/components/Checkbox/CheckboxGroup.tsx          ← sub-component
Creates: src/components/Checkbox/Checkbox.css
Creates: src/components/Checkbox/Checkbox.test.tsx          ← covers both specs
Creates: src/components/Checkbox/index.ts
Creates: src/components/Checkbox/_e2e/Checkbox.page.ts      ← page object
Creates: src/components/Checkbox/_stories/Checkbox.stories.tsx
Creates: src/components/Checkbox/_stories/CheckboxGroup.stories.tsx       ← sub-component stories
Creates: src/components/Checkbox/_stories/CheckboxForms.stories.tsx       ← reactive forms → controlled
Creates: src/components/Checkbox/_stories/CheckboxGroupForms.stories.tsx  ← group forms stories
Creates: src/components/Checkbox/_stories/CheckboxOverview.stories.tsx
Creates: src/components/Checkbox/_docs/Checkbox.mdx
Creates: src/components/Checkbox/_docs/CheckboxApi.mdx
Creates: src/components/Checkbox/_docs/CheckboxGroup.mdx                  ← sub-component overview
Creates: src/components/Checkbox/_docs/CheckboxGroupApi.mdx               ← sub-component API
Creates: src/components/Checkbox/_docs/CheckboxMigration.mdx

-- Step 6: Update barrel --
Updates: src/index.ts (adds Checkbox + CheckboxGroup exports)

-- Step 7: Commit & push --
Runs: git add + commit + push
```

---

## Step 8 — Post-migration verification report

After committing, glob both directories and print a structured report showing every Angular source file, its React counterpart, and overall stats. Run this step every time a migration completes.

### How to produce the report

1. Fetch the GitHub Contents API for the Angular source path and collect every file entry.
2. Glob the React target path (`src/components/<PascalName>/`) and collect every file.
3. For each Angular file apply the mapping rules below to determine its expected React equivalent (or mark it N/A).
4. Check whether the expected React file exists in the target.
5. Print the full table and summary block shown in the output format.

### Mapping rules (Angular → React)

| Angular file pattern | React equivalent | Notes |
|---|---|---|
| `*.component.ts` + `*.component.html` | `<PascalName>.tsx` | Merged into one TSX |
| `*.component.scss` | `<PascalName>.css` | All SCSS files merge into one CSS |
| `*-group.component.ts` | `<PascalName>Group.tsx` | Sub-component |
| `*-group.component.scss` | `<PascalName>.css` | Merged |
| `*.component.spec.ts` | `<PascalName>.test.tsx` | All specs merge into one test file |
| `*-group.component.spec.ts` | `<PascalName>.test.tsx` | Merged |
| `*.types.ts` | `<PascalName>.tsx` (inline types) | Merged |
| `*.page.ts` | `_e2e/<PascalName>.page.ts` | All page objects merge into one |
| `*-group.page.ts` | `_e2e/<PascalName>.page.ts` | Merged |
| `public_api.ts` / `index.ts` | `index.ts` | Barrel export |
| `_stories/<component>.stories.ts` | `_stories/<PascalName>.stories.tsx` | |
| `_stories/overview-<component>.stories.ts` | `_stories/<PascalName>Overview.stories.tsx` | |
| `_stories/*-group.stories.ts` | `_stories/<PascalName>Group.stories.tsx` | |
| `_stories/*-reactive-forms.stories.ts` | `_stories/<PascalName>Forms.stories.tsx` | |
| `_stories/*-group-forms.stories.ts` | `_stories/<PascalName>GroupForms.stories.tsx` | |
| `_docs/*-overview.mdx` | `_docs/<PascalName>.mdx` | |
| `_docs/*-api.mdx` | `_docs/<PascalName>Api.mdx` | |
| `_docs/*-group-overview.mdx` | `_docs/<PascalName>Group.mdx` | |
| `_docs/*-group-api.mdx` | `_docs/<PascalName>GroupApi.mdx` | |
| `_docs/*-migrate-from-*.mdx` | `_docs/<PascalName>Migration.mdx` | |
| `*.module.ts` | — | N/A — Angular module system |
| `ng-package.json` | — | N/A — Angular build config |
| `*-required-validator.ts` | — | N/A — Angular NG_VALIDATORS directive |

### Output format

Print the report in this structure (replace the Checkbox example values with the actual component's data):

```text
MIGRATION REPORT — Checkbox
Source : github.com/nice-cxone/sol-components → projects/ds-components/checkbox/src/lib/
Target : src/components/Checkbox/

FILE MAPPING
  ✅  checkbox.component.ts / .html   → Checkbox.tsx
  ✅  checkbox.component.scss         → Checkbox.css
  ✅  checkbox-group.component.ts     → CheckboxGroup.tsx  (sub-component)
  ✅  checkbox-group.component.scss   → Checkbox.css  (merged)
  ✅  checkbox.types.ts               → Checkbox.tsx  (inline types)
  ✅  checkbox.component.spec.ts      → Checkbox.test.tsx
  ✅  checkbox-group.component.spec.ts → Checkbox.test.tsx  (merged)
  ✅  checkbox.page.ts                → _e2e/Checkbox.page.ts
  ✅  checkbox-group.page.ts          → _e2e/Checkbox.page.ts  (merged)
  ✅  _stories/checkbox.stories.ts    → _stories/Checkbox.stories.tsx
  ✅  _stories/checkbox-group.stories.ts → _stories/CheckboxGroup.stories.tsx
  ✅  _stories/checkbox-reactive-forms.stories.ts → _stories/CheckboxForms.stories.tsx
  ✅  _stories/checkbox-group-forms.stories.ts    → _stories/CheckboxGroupForms.stories.tsx
  ✅  _stories/overview-checkbox.stories.ts       → _stories/CheckboxOverview.stories.tsx
  ✅  _docs/checkbox-overview.mdx      → _docs/Checkbox.mdx
  ✅  _docs/checkbox-api.mdx           → _docs/CheckboxApi.mdx
  ✅  _docs/checkbox-group-overview.mdx → _docs/CheckboxGroup.mdx
  ✅  _docs/checkbox-group-api.mdx     → _docs/CheckboxGroupApi.mdx
  ✅  _docs/checkbox-migrate-from-breeze.mdx → _docs/CheckboxMigration.mdx
  ✅  public_api.ts                    → index.ts
  ⬜  checkbox.module.ts               → N/A  (Angular module)
  ⬜  ng-package.json                  → N/A  (Angular build config)
  ⬜  checkbox-required-validator.ts   → N/A  (Angular NG_VALIDATORS)

STORY COUNT
  checkbox.stories.ts (1)                → Checkbox.stories.tsx (1)            ✅
  checkbox-group.stories.ts (2)          → CheckboxGroup.stories.tsx (2)       ✅
  checkbox-reactive-forms.stories.ts (1) → CheckboxForms.stories.tsx (1)       ✅
  checkbox-group-forms.stories.ts (2)    → CheckboxGroupForms.stories.tsx (2)  ✅
  overview-checkbox.stories.ts (9)       → CheckboxOverview.stories.tsx (9)    ✅

SUMMARY
  Angular source : 26 files  (21 ported → 16 <framework> files, 3 N/A)
  <framework> target : 16 files  (2 components, 1 CSS, 1 test, 5 stories, 5 docs, 1 e2e, 1 barrel)
  Missing        : 0
  Coverage       : 100% ✅
```

If any file is missing, add a section at the end:

```text
ACTION REQUIRED — 2 missing files
  ❌  _docs/CheckboxGroup.mdx         ← from checkbox-group-overview.mdx
  ❌  _stories/CheckboxGroupForms.stories.tsx  ← from checkbox-group-forms.stories.ts
```

Adjust the SUMMARY numbers to reflect actual missing count and coverage percentage.
