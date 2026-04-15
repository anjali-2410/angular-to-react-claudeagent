import type { Meta } from '@storybook/react';

/**
 * Overview story — renders the MDX doc page for the Autocomplete component.
 * The actual content is in _docs/Autocomplete.mdx.
 */
const meta: Meta = {
  title: 'Components/Autocomplete/Overview',
  parameters: {
    docs: {
      page: () => null,
    },
  },
};

export default meta;
