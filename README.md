# SOL React Components

React component library auto-converted from the [SOL Angular component library](https://github.com/nice-cxone/sol-components) using a custom Claude agent.

## Components

Converted from 45 Angular components including: Button, Modal, Card, Dropdown, Tabs, Tooltip, and more.

Each component lives in `src/components/<ComponentName>/` with:
- `ComponentName.tsx` — React functional component
- `ComponentName.module.css` — CSS Modules styles
- `ComponentName.test.tsx` — React Testing Library tests
- `index.ts` — barrel export

## Usage

```tsx
import { Button } from '@niceltd/sol-react';

function App() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      Click me
    </Button>
  );
}
```

## Development

```bash
npm install
npm run build       # TypeScript build
npm test            # Run tests
npm run test:watch  # Watch mode
```

## Conversion Agent

The `angular-to-react-agent/` directory contains the Claude-powered agent that automates the conversion. See [agent README](../angular-to-react-agent/README.md) for details.
