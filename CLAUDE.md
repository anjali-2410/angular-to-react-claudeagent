# CLAUDE.md — SOL React Component Library

This file provides guidance to Claude Code when working in this repository.

## What Is This Repo?

This is the **React target repo** for migrating Angular SOL components from the source repo:
- **Source (Angular):** `C:/Users/anjsonawane/sol-components/` — Angular 17 component library
- **Target (React):** This repo — React 18 component library with identical API surface

---

## Essential Commands

### Development
```bash
npm install                   # Install dependencies
npm run storybook             # Start Storybook on port 6007
npm run test                  # Run tests once (vitest)
npm run test:watch            # Run tests in watch mode
npm run build                 # TypeScript compile
npm run lint                  # ESLint
npm run build-storybook       # Build static Storybook
```

---

## Custom Agent — Migrate Component

Use the custom slash command to migrate any Angular SOL component to React:

```
/migrate-component <component-name>
```

**Examples:**
```
/migrate-component checkbox
/migrate-component text-input
/migrate-component radio-button
/migrate-component spinner
/migrate-component tabs
/migrate-component modal
/migrate-component date-picker
```

The agent reads from the Angular source repo, generates all React files, and pushes to this repo automatically.

**Full agent instructions:** `.claude/commands/migrate-component.md`

---

## Project Structure

```
angular-to-react-claudeagent/
├── .claude/
│   └── commands/
│       └── migrate-component.md    # Custom agent slash command
├── .storybook/
│   ├── main.ts                     # Storybook config
│   └── preview.ts                  # Global preview/decorators
├── src/
│   ├── index.ts                    # Barrel export (all components)
│   ├── test-setup.ts               # Vitest + @testing-library setup
│   └── components/
│       └── <ComponentName>/        # One directory per component
│           ├── <ComponentName>.tsx         # React component
│           ├── <ComponentName>.css         # Styles (CSS custom properties)
│           ├── <ComponentName>.test.tsx    # Vitest unit tests
│           ├── index.ts                    # Barrel export
│           ├── _stories/
│           │   ├── <ComponentName>.stories.tsx         # Interactive stories
│           │   └── <ComponentName>Overview.stories.tsx # Docs-only
│           └── _docs/
│               ├── <ComponentName>.mdx           # Overview doc page
│               ├── <ComponentName>Api.mdx         # API reference
│               └── <ComponentName>Migration.mdx   # Angular → React guide
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Angular Source Repo Structure

Each Angular component lives at:
```
C:/Users/anjsonawane/sol-components/projects/ds-components/<component-name>/
├── src/lib/
│   ├── <component>.component.ts        # Angular component class
│   ├── <component>.component.html      # Angular template
│   ├── <component>.component.scss      # SCSS styles
│   ├── <component>.module.ts           # Angular module
│   ├── enum/                           # TypeScript enums
│   ├── _docs/                          # MDX documentation
│   └── _stories/                       # Storybook stories
├── public_api.ts                       # Public exports
└── index.ts
```

**Available Angular components to migrate:**
accordion, action-bar, autocomplete, breadcrumb, button ✅, calendar, card, checkbox,
chip, chip-group, conversation, date-picker, date-range-picker, dropdown, grid, icon,
info-overlay, inline-notification, label, label-error-message, menu, modal,
numeric-selector, omnibar, progress-bar, query-builder, radio-button, range-slider,
select, spinner, status-indicator, switch, tabs, tagify, text-area, text-counter,
text-input, time-duration, time-picker, toastr, toggle-group, tooltip, translation, wizard

---

## Code Style Rules

- **React 18** functional components only (no class components)
- **TypeScript strict mode** — all props typed with interfaces
- **`forwardRef`** for components that expose imperative handles (focus, etc.)
- **CSS custom properties** using `--sol-*` design tokens (never hardcode colors/sizes)
- **CSS class names** must match the Angular source exactly (enables drop-in replacement)
- **Vitest** for testing, not Jest
- **`@testing-library/react`** — use `screen`, `userEvent`, `render`
- **Storybook 8** with `@storybook/react-vite`
- **Single quotes** in TypeScript, **double quotes** in JSX attribute strings

---

## Design Token Integration

This library uses `@niceltd/sol-tokens` CSS custom properties. Import in your app:
```css
@import '@niceltd/sol-tokens/sol-tokens.css';
```

All SOL tokens are prefixed with `--sol-` (e.g., `--sol-color-background-action-primary`).

---

## Key Technology Mapping (Angular → React)

| Angular | React Equivalent |
|---------|-----------------|
| `@angular/material` | Custom CSS + headless logic |
| `ag-grid-angular` | `ag-grid-react` |
| `ngx-toastr` | `react-toastify` |
| `tippy.js` | `tippy.js` (same) |
| `nouislider` | `nouislider` (vanilla, used via `useEffect`) |
| `@angular/cdk/overlay` | `@floating-ui/react` |
| `@angular/cdk/a11y` | Native ARIA + React refs |
| `rxjs` | React state + callbacks |
| Angular signals | React `useState` / `useMemo` / `useCallback` |

---

## Git & Changelog Conventions

- **Commit format:** `feat(<component-name>): migrate Angular SOL <ComponentName> to React`
- **Push directly to `main`** after each migration
- Each component migration = one commit

---

## Source Repo Read Permission

Claude has **read access** to the Angular source repo at:
`C:/Users/anjsonawane/sol-components/`

Claude has **write + push access** to this React target repo.
