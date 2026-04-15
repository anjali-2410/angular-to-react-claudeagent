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

2. **Analyze** the Angular component:
   - `*.component.ts` — inputs, outputs, logic
   - `*.component.html` — template structure
   - `*.component.scss` — styles (converted to CSS custom properties)
   - `*.module.ts` — imports/dependencies
   - `enum/*.enum.ts` — TypeScript enums
   - `_docs/*.mdx` — documentation
   - `_stories/*.stories.ts` — Storybook stories
   - `*.spec.ts` — unit tests

3. **Generate React equivalents** in `src/components/<ComponentName>/`:
   - `<ComponentName>.tsx` — React component (TypeScript, forwardRef where needed)
   - `<ComponentName>.css` — CSS (Angular SCSS → CSS custom properties, same class names)
   - `<ComponentName>.test.tsx` — Vitest + @testing-library/react tests
   - `index.ts` — barrel export
   - `_stories/<ComponentName>.stories.tsx` — interactive Storybook stories
   - `_stories/<ComponentName>Overview.stories.tsx` — docs-only overview story
   - `_docs/<ComponentName>.mdx` — Overview doc page
   - `_docs/<ComponentName>Api.mdx` — API reference
   - `_docs/<ComponentName>Migration.mdx` — Angular → React migration guide

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

Create all files in `src/components/<PascalName>/`:
```
src/components/<PascalName>/
├── <PascalName>.tsx
├── <PascalName>.css
├── <PascalName>.test.tsx
├── index.ts
├── _stories/
│   ├── <PascalName>.stories.tsx
│   └── <PascalName>Overview.stories.tsx
└── _docs/
    ├── <PascalName>.mdx
    ├── <PascalName>Api.mdx
    └── <PascalName>Migration.mdx
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

- [ ] Component renders without errors (TypeScript compiles cleanly)
- [ ] All Angular `input()` signals mapped to React props with correct types
- [ ] All Angular `output()` signals mapped to callback props
- [ ] `ng-content` → `children` (or named slots → render props)
- [ ] SCSS class names preserved identically in CSS
- [ ] CSS uses `--sol-*` custom properties (not hardcoded values)
- [ ] Storybook stories have matching names and controls to Angular source
- [ ] Tests cover the same scenarios as Angular spec file
- [ ] `src/index.ts` updated with new exports
- [ ] No Angular-specific imports remain in React files

---

## Example: Running the Agent

```
User: /migrate-component checkbox

Agent actions:
1. Reads: projects/ds-components/checkbox/src/lib/checkbox.component.ts
2. Reads: projects/ds-components/checkbox/src/lib/checkbox.component.html
3. Reads: projects/ds-components/checkbox/src/lib/checkbox.component.scss
4. Reads: projects/ds-components/checkbox/src/lib/_stories/checkbox.stories.ts
5. Reads: projects/ds-components/checkbox/src/lib/checkbox.component.spec.ts
6. Creates: src/components/Checkbox/Checkbox.tsx
7. Creates: src/components/Checkbox/Checkbox.css
8. Creates: src/components/Checkbox/Checkbox.test.tsx
9. Creates: src/components/Checkbox/index.ts
10. Creates: src/components/Checkbox/_stories/Checkbox.stories.tsx
11. Creates: src/components/Checkbox/_stories/CheckboxOverview.stories.tsx
12. Creates: src/components/Checkbox/_docs/Checkbox.mdx
13. Creates: src/components/Checkbox/_docs/CheckboxApi.mdx
14. Creates: src/components/Checkbox/_docs/CheckboxMigration.mdx
15. Updates: src/index.ts (adds Checkbox exports)
16. Runs: git add + commit + push
```
