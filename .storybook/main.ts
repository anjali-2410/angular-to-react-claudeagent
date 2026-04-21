import type { StorybookConfig } from '@storybook/react-vite';
import vue from '@vitejs/plugin-vue';

// ─── Story discovery ────────────────────────────────────────────────────────
// Mirrors the Angular SOL Storybook discovery pattern:
//   ../../ds-components/**/*.stories.@(js|jsx|ts|tsx)
//   ../../ds-components/**/*.mdx
//
// Structure per component:
//   src/components/<Name>/
//     ├── _stories/<Name>.stories.tsx        (interactive examples with controls)
//     ├── _stories/<Name>Overview.stories.tsx (docs-only, hidden, used in MDX Canvas blocks)
//     ├── _docs/<Name>.mdx                    (Overview: guidelines + Canvas examples)
//     ├── _docs/<Name>Api.mdx                 (API reference with ArgTypes)
//     └── _docs/<Name>Migration.mdx           (Migration notes from Angular)

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: false, // Manual docs via .mdx files (mirrors Angular SOL setup)
  },
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), vue()];
    return config;
  },
};

export default config;
