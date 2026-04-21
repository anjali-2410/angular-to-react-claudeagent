import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW / DOCS-ONLY STORIES
// ─────────────────────────────────────────────────────────────────────────────
// These stories are HIDDEN from the Storybook sidebar and are ONLY used as
// embedded Canvas examples inside Button.mdx documentation pages.
//
// This matches the Angular SOL Storybook pattern:
//   overview-button.stories.ts — tags: ['hidden', 'docs-only']
//
// DO NOT add these to the sidebar navigation or use them as interactive demos.
// ─────────────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 0 1 0 2H9v4a1 1 0 0 1-2 0V9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 1-1z" />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button/OverviewExamples',
  component: Button,
  // Hide from sidebar — used only in MDX Canvas blocks
  tags: ['hidden', 'docs-only'],
  parameters: { controls: { disable: true },
    actions:  { disable: true },
    layout:   'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ── Variants ────────────────────────────────────────────────────────────────
export const PrimaryButton: Story = {
  render: () => <Button variant="primary">Primary</Button>,
};

export const SecondaryButton: Story = {
  render: () => <Button variant="secondary">Secondary</Button>,
};

export const TertiaryButton: Story = {
  render: () => <Button variant="tertiary">Tertiary</Button>,
};

export const CriticalButton: Story = {
  render: () => <Button variant="critical">Critical</Button>,
};

// ── All variants row ─────────────────────────────────────────────────────────
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="critical">Critical</Button>
    </div>
  ),
};

// ── Sizes ────────────────────────────────────────────────────────────────────
export const LargeButton: Story = {
  render: () => <Button variant="primary" size="large">Large</Button>,
};

export const MediumButton: Story = {
  render: () => <Button variant="primary" size="medium">Medium</Button>,
};

export const SmallButton: Story = {
  render: () => <Button variant="primary" size="small">Small</Button>,
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button variant="primary" size="large">Large</Button>
      <Button variant="primary" size="medium">Medium</Button>
      <Button variant="primary" size="small">Small</Button>
    </div>
  ),
};

// ── States ───────────────────────────────────────────────────────────────────
export const DefaultButton: Story = {
  render: () => <Button variant="primary">Default</Button>,
};

export const DisabledButton: Story = {
  render: () => <Button variant="primary" disabled>Disabled</Button>,
};

export const AltDisabledButton: Story = {
  render: () => <Button variant="primary" disabledAltState>Alt Disabled</Button>,
};

// ── Icons ────────────────────────────────────────────────────────────────────
export const LeadingIconButton: Story = {
  render: () => <Button variant="primary" icon={<PlusIcon />}>Button Text</Button>,
};

export const TrailingIconButton: Story = {
  render: () => <Button variant="primary" iconEnd={<PlusIcon />}>Button Text</Button>,
};

export const DualIconButton: Story = {
  render: () => (
    <Button variant="primary" icon={<PlusIcon />} iconEnd={<PlusIcon />}>
      Button Text
    </Button>
  ),
};

export const IconOnlyButton: Story = {
  render: () => (
    <Button variant="primary" icon={<PlusIcon />} ariaLabel="Add item" />
  ),
};
