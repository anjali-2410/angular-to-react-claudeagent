# migrate-component

Migrate an Angular SOL component from the source repo into this React target repo.

## Usage

```
/migrate-component <component-name>
```

**Examples:**
```
/migrate-component checkbox
/migrate-component text-input
/migrate-component radio-button
/migrate-component spinner
```

---

## What This Agent Does

Given a component name (e.g. `checkbox`), this agent will:

1. **Read all source files** from the Angular repo at:
   `C:/Users/anjsonawane/sol-components/projects/ds-components/<component-name>/src/lib/`

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

## Step-by-Step Execution

When the user runs `/migrate-component <name>`:

### Step 1 — Resolve component name

Convert `<name>` to:

- `kebabName` = `<name>` as-is (e.g., `text-input`)
- `PascalName` = PascalCase (e.g., `TextInput`)
- `sourcePath` = `C:/Users/anjsonawane/sol-components/projects/ds-components/<kebabName>/src/lib/`
- `targetPath` = `src/components/<PascalName>/`

### Step 2 — Read ALL source files

Read every file in `sourcePath`:

- TypeScript (`.ts`)
- HTML template (`.html`)
- SCSS (`.scss`)
- Stories (`.stories.ts`)
- Specs (`.spec.ts`)
- MDX docs (`.mdx`)
- Enums (`enum/`)

### Step 3 — Analyze and convert

Apply all Conversion Rules above. Pay special attention to:

- All `input()` signals → React props
- All `output()` signals → React callback props
- Template control flow (`@if`, `@for`, `@switch`) → JSX expressions
- `ng-content` → `children` prop
- SCSS compiled output → CSS with custom properties

### Step 4 — Design Tokens & Styling

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

### Step 5 — Write target files

Create all files in `src/components/<PascalName>/`. The exact set of files depends on what exists in the Angular source — use the tree below as a template and add/remove files to match the source 1-to-1:

```text
src/components/<PascalName>/
├── <PascalName>.tsx                          ← primary component
├── <SubComponentName>.tsx                    ← one per sub-component (if any)
├── <PascalName>.css                          ← all component styles in one file
├── <PascalName>.test.tsx                     ← covers all specs (primary + sub)
├── index.ts                                  ← barrel export for everything
├── _e2e/
│   └── <PascalName>.page.ts                 ← only if .page.ts exists in source
├── _stories/
│   ├── <PascalName>.stories.tsx             ← one per Angular .stories.ts
│   ├── <PascalName>Overview.stories.tsx     ← from overview-*.stories.ts
│   ├── <SubComponentName>.stories.tsx       ← from *-group.stories.ts (if exists)
│   ├── <PascalName>Forms.stories.tsx        ← from *-reactive-forms.stories.ts (if exists)
│   └── <SubComponentName>Forms.stories.tsx  ← from *-group-forms.stories.ts (if exists)
└── _docs/
    ├── <PascalName>.mdx                     ← from *-overview.mdx
    ├── <PascalName>Api.mdx                  ← from *-api.mdx
    ├── <PascalName>Migration.mdx            ← from *-migrate-from-*.mdx
    ├── <SubComponentName>.mdx               ← from *-group-overview.mdx (if exists)
    └── <SubComponentName>Api.mdx            ← from *-group-api.mdx (if exists)
```

### Step 6 — Update barrel export

In `src/index.ts`, add:
```typescript
export { <PascalName> } from './components/<PascalName>';
export type { <PascalName>Props } from './components/<PascalName>';
```

### Step 7 — Commit and push

```bash
cd /c/Users/anjsonawane/angular-to-react-claudeagent
git add src/components/<PascalName>/ src/index.ts
git commit -m "feat(<kebabName>): migrate Angular SOL <PascalName> to React"
git push origin main
```

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
kebabName  = checkbox
PascalName = Checkbox
sourcePath = C:/Users/anjsonawane/sol-components/projects/ds-components/checkbox/src/lib/

-- Step 2: Read ALL source files (glob everything) --
Reads: checkbox.component.ts              ← primary component
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

1. Glob the Angular source path and collect every file.
2. Glob the React target path and collect every file.
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

Print the report in this exact structure:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MIGRATION VERIFICATION — <ComponentName>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Source : C:/Users/anjsonawane/sol-components/.../<component>/src/lib/
  Target : src/components/<PascalName>/

  FILE MAPPING
  ┌─────────────────────────────────────────────────┬──────────────────────────────────────────┬────────┐
  │ Angular source                                  │ React target                             │ Status │
  ├─────────────────────────────────────────────────┼──────────────────────────────────────────┼────────┤
  │ checkbox.component.ts                           │ Checkbox.tsx                             │  ✅    │
  │ checkbox.component.html                         │ Checkbox.tsx  (inline JSX)               │  ✅    │
  │ checkbox.component.scss                         │ Checkbox.css                             │  ✅    │
  │ checkbox-group.component.ts                     │ CheckboxGroup.tsx                        │  ✅    │
  │ checkbox-group.component.scss                   │ Checkbox.css  (merged)                   │  ✅    │
  │ checkbox.types.ts                               │ Checkbox.tsx  (inline types)             │  ✅    │
  │ checkbox.component.spec.ts                      │ Checkbox.test.tsx                        │  ✅    │
  │ checkbox-group.component.spec.ts                │ Checkbox.test.tsx  (merged)              │  ✅    │
  │ checkbox.page.ts                                │ _e2e/Checkbox.page.ts                    │  ✅    │
  │ checkbox-group.page.ts                          │ _e2e/Checkbox.page.ts  (merged)          │  ✅    │
  │ _stories/checkbox.stories.ts                    │ _stories/Checkbox.stories.tsx            │  ✅    │
  │ _stories/checkbox-group.stories.ts              │ _stories/CheckboxGroup.stories.tsx       │  ✅    │
  │ _stories/checkbox-reactive-forms.stories.ts     │ _stories/CheckboxForms.stories.tsx       │  ✅    │
  │ _stories/checkbox-group-forms.stories.ts        │ _stories/CheckboxGroupForms.stories.tsx  │  ✅    │
  │ _stories/overview-checkbox.stories.ts           │ _stories/CheckboxOverview.stories.tsx    │  ✅    │
  │ _docs/checkbox-overview.mdx                     │ _docs/Checkbox.mdx                       │  ✅    │
  │ _docs/checkbox-api.mdx                          │ _docs/CheckboxApi.mdx                    │  ✅    │
  │ _docs/checkbox-group-overview.mdx               │ _docs/CheckboxGroup.mdx                  │  ✅    │
  │ _docs/checkbox-group-api.mdx                    │ _docs/CheckboxGroupApi.mdx               │  ✅    │
  │ _docs/checkbox-migrate-from-breeze.mdx          │ _docs/CheckboxMigration.mdx              │  ✅    │
  │ public_api.ts                                   │ index.ts                                 │  ✅    │
  │ checkbox.module.ts                              │ —  (N/A: Angular module)                 │  ✅    │
  │ ng-package.json                                 │ —  (N/A: Angular build config)           │  ✅    │
  │ checkbox-required-validator.ts                  │ —  (N/A: Angular NG_VALIDATORS)          │  ✅    │
  └─────────────────────────────────────────────────┴──────────────────────────────────────────┴────────┘

  STORY COUNT
  ┌──────────────────────────────────────────────┬────────┬──────────────────────────────────────────┬────────┬────────┐
  │ Angular stories file                         │ Count  │ React stories file                       │ Count  │ Status │
  ├──────────────────────────────────────────────┼────────┼──────────────────────────────────────────┼────────┼────────┤
  │ checkbox.stories.ts                          │   1    │ Checkbox.stories.tsx                     │   1    │  ✅    │
  │ checkbox-group.stories.ts                    │   2    │ CheckboxGroup.stories.tsx                │   2    │  ✅    │
  │ checkbox-reactive-forms.stories.ts           │   1    │ CheckboxForms.stories.tsx                │   1    │  ✅    │
  │ checkbox-group-forms.stories.ts              │   2    │ CheckboxGroupForms.stories.tsx           │   2    │  ✅    │
  │ overview-checkbox.stories.ts                 │   9    │ CheckboxOverview.stories.tsx             │   9    │  ✅    │
  └──────────────────────────────────────────────┴────────┴──────────────────────────────────────────┴────────┴────────┘

  STATS
  ┌──────────────────────────────────────────────────────────────────┐
  │  Angular source files total        26                            │
  │  ├─ Ported to React                21  (merged into 16 files)   │
  │  └─ Not applicable (Angular-only)   3  (module, package, validator) │
  │                                                                  │
  │  React target files total          16                            │
  │  ├─ Components                      2  (Checkbox, CheckboxGroup) │
  │  ├─ Styles                          1  (Checkbox.css)            │
  │  ├─ Tests                           1  (Checkbox.test.tsx)       │
  │  ├─ Barrel export                   1  (index.ts)                │
  │  ├─ E2E page objects                1  (_e2e/Checkbox.page.ts)   │
  │  ├─ Storybook stories               5  (_stories/)               │
  │  └─ Documentation                   5  (_docs/)                  │
  │                                                                  │
  │  Missing files                      0                            │
  │  Coverage                         100%                           │
  └──────────────────────────────────────────────────────────────────┘

  ✅  Migration complete — all source files accounted for.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If any row shows ❌ in the Status column, list the missing files separately after the table:

```text
  MISSING FILES (action required)
  ─────────────────────────────────────────────────────────────
  ❌  _docs/CheckboxGroup.mdx   ← from checkbox-group-overview.mdx
  ❌  _stories/CheckboxGroupForms.stories.tsx  ← from checkbox-group-forms.stories.ts
```

Adjust the STATS block to reflect the actual missing count and coverage percentage.
