import type { Preview } from '@storybook/react';

// ─── Global Storybook preview configuration ──────────────────────────────────
// Mirrors the Angular SOL Storybook preview.js setup:
//   - Custom story sort order (Introduction → Setup → Guidelines → Components)
//   - Background color choices matching SOL colour tokens
//   - Accessibility (a11y) testing standards

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // ── Background colours matching SOL design tokens ───────────────────────
    backgrounds: {
      default: 'Solaris100',
      values: [
        { name: 'Solaris100', value: '#ECF3F8' }, // Default SOL canvas background
        { name: 'White',      value: '#FFFFFF' },
        { name: 'Solaris50',  value: '#F5F9FB' },
      ],
    },

    // ── Accessibility testing ────────────────────────────────────────────────
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },

    // ── Story sort order ────────────────────────────────────────────────────
    // Mirrors the Angular SOL Storybook sort:
    //   0: Introduction
    //   1: Setup (Getting Started, SOL AI Toolkit)
    //   2: Guidelines
    //   3: Components (alphabetical by name)
    options: {
      storySort: {
        order: [
          'Introduction',
          'Setup',   ['Getting Started', 'SOL AI Toolkit'],
          'Guidelines',
          'Components', ['*', ['Overview', 'API', 'Migrate from Breeze', 'Examples']],
        ],
      },
    },
  },
};

export default preview;
