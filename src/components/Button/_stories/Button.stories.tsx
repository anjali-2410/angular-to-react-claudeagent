import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

// ─── Shared demo icon ────────────────────────────────────────────────────────
// Matches the "+" icon used throughout the Angular SOL Button Storybook

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

// ─── Meta ────────────────────────────────────────────────────────────────────
// Sidebar path mirrors the Angular SOL Storybook:
//   Components > Button > Examples > {story}

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Examples',
  component: Button,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'critical'],
      description: 'Visual style variant',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small'],
      description: 'Button size',
      table: { defaultValue: { summary: 'large' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button (HTML disabled)',
    },
    disabledAltState: {
      control: 'boolean',
      description: 'Visual-only disabled — button remains focusable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─────────────────────────────────────────────────────────────────────────────
// Button Styles — all 4 variants side-by-side
// Matches Angular SOL "Button Styles" story
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonStyles: Story = {
  name: 'Button Styles',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary"   icon={<PlusIcon />}>Button Text</Button>
      <Button variant="secondary" icon={<PlusIcon />}>Button Text</Button>
      <Button variant="tertiary"  icon={<PlusIcon />}>Button Text</Button>
      <Button variant="critical"  icon={<PlusIcon />}>Button Text</Button>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button Sizes — large / medium / small
// Matches Angular SOL "Button Sizes" story
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonSizes: Story = {
  name: 'Button Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" size="large">Large</Button>
      <Button variant="primary" size="medium">Medium</Button>
      <Button variant="primary" size="small">Small</Button>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button States — default / disabled / alt-disabled per variant
// Matches Angular SOL "Button States" story
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonStates: Story = {
  name: 'Button States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {(['primary', 'secondary', 'tertiary', 'critical'] as const).map(v => (
        <div key={v} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant={v}>Default</Button>
          <Button variant={v} disabled>Disabled</Button>
          <Button variant={v} disabledAltState>Alt Disabled</Button>
        </div>
      ))}
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button Icon — leading icon, trailing icon, icon-only
// Matches Angular SOL "Button Icon" story
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonIcon: Story = {
  name: 'Button Icon',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Leading icon + text */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary"   icon={<PlusIcon />}>Button Text</Button>
        <Button variant="secondary" icon={<PlusIcon />}>Button Text</Button>
        <Button variant="tertiary"  icon={<PlusIcon />}>Button Text</Button>
      </div>

      {/* Trailing icon + text */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary"   iconEnd={<PlusIcon />}>Button Text</Button>
        <Button variant="secondary" iconEnd={<PlusIcon />}>Button Text</Button>
      </div>

      {/* Icon-only — ariaLabel required for accessibility */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="primary"   icon={<PlusIcon />} ariaLabel="Icon only" />
        <Button variant="secondary" icon={<PlusIcon />} ariaLabel="Custom tooltip icon only text" />
      </div>
    </div>
  ),
};
