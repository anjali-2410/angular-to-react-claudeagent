/**
 * Chip overview stories — converted from overview-chip.stories.ts
 * Stories: SimpleChip, ChipWithClose, ErrorStateChip
 */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import { Chip } from '../Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip/OverviewExamples',
  component: Chip,
  parameters: { controls: { disable: true },
    actions: { disable: false },
    docs: { disable: false },
  },
  tags: ['hidden', 'docs-only'],
};

export default meta;
type Story = StoryObj<typeof Chip>;

/** Shared leading icon SVG used across overview stories */
const LeadingIcon = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M10.68 0H1.32C0.6 0 0 0.6 0 1.32V10.68C0 11.4 0.6 12 1.32 12H10.68C11.4 12 12 11.4 12 10.68V1.32C12 0.6 11.4 0 10.68 0V0ZM10.8 10.8H1.2V1.2H10.8V10.8ZM9 10.2C9.3 10.2 9.6 9.9 9.6 9.54V4.98C9.6 4.62 9.36 4.32 9 4.32C8.64 4.32 8.4 4.62 8.4 4.98V9.54C8.4 9.9 8.7 10.2 9 10.2ZM9 3.72C9.36 3.72 9.6 3.42 9.6 3.06C9.6 2.7 9.36 2.4 9 2.4C8.64 2.4 8.4 2.7 8.4 3.06C8.4 3.42 8.64 3.72 9 3.72ZM6 10.2C6.3 10.2 6.6 9.9 6.6 9.6V5.4C6.6 5.1 6.36 4.8 6 4.8C5.7 4.8 5.4 5.1 5.4 5.4V9.6C5.4 9.9 5.7 10.2 6 10.2ZM6 4.2C6.36 4.2 6.6 3.96 6.6 3.6C6.6 3.24 6.36 3 6 3C5.64 3 5.4 3.24 5.4 3.6C5.4 3.96 5.64 4.2 6 4.2ZM3 10.2C3.3 10.2 3.6 9.96 3.6 9.72V6.48C3.6 6.18 3.36 6 3 6C2.64 6 2.4 6.18 2.4 6.48V9.72C2.4 9.96 2.7 10.2 3 10.2ZM3 5.4C3.36 5.4 3.6 5.16 3.6 4.8C3.6 4.44 3.36 4.2 3 4.2C2.64 4.2 2.4 4.44 2.4 4.8C2.4 5.16 2.64 5.4 3 5.4Z"
      fill="#767676"
    />
  </svg>
);

/** Minimal chip without a remove button — medium and small sizes side by side */
export const SimpleChip: Story = {
  name: 'SimpleChip',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Chip label="Medium Chip" size="medium" icon={LeadingIcon} onChipClicked={action('chip clicked')} />
      <Chip label="Small Chip" size="small" icon={LeadingIcon} onChipClicked={action('chip clicked')} />
    </div>
  ),
};

/** Interactive chip with close button for removable filters or selected tags */
export const ChipWithClose: Story = {
  name: 'ChipWithClose',
  render: () => <Chip label="Main Label with remove" allowClose onClosed={action('chip closed')} />,
};

/** Chip in error state */
export const ErrorStateChip: Story = {
  name: 'ErrorStateChip',
  render: () => <Chip label="Validation failed" allowClose errorState />,
};
