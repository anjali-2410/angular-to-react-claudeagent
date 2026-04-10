import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// ─── Shared icon ──────────────────────────────────────────────────────────────
// Mirrors the "+" icon used throughout the Angular SOL Button Storybook examples

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

// ─── Meta ─────────────────────────────────────────────────────────────────────
// title mirrors the Angular SOL Storybook structure:
//   Components > Button > Examples > {story name}

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Examples',
  component: Button,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'critical'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small'],
      description: 'Size of the button control',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button (HTML disabled attribute)',
    },
    disabledAltState: {
      control: 'boolean',
      description: 'Visual-only disabled styling — button remains focusable',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─────────────────────────────────────────────────────────────────────────────
// Button Styles
// Shows all four variants (primary, secondary, tertiary, critical) side-by-side.
// Mirrors the Angular "Button Styles" story from the SOL Storybook.
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonStyles: Story = {
  name: 'Button Styles',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" icon={<PlusIcon />}>
        Button Text
      </Button>
      <Button variant="secondary" icon={<PlusIcon />}>
        Button Text
      </Button>
      <Button variant="tertiary" icon={<PlusIcon />}>
        Button Text
      </Button>
      <Button variant="critical" icon={<PlusIcon />}>
        Button Text
      </Button>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button Sizes
// Shows large, medium, and small buttons in the primary variant.
// Mirrors the Angular "Button Sizes" story from the SOL Storybook.
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonSizes: Story = {
  name: 'Button Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" size="large">
        Large
      </Button>
      <Button variant="primary" size="medium">
        Medium
      </Button>
      <Button variant="primary" size="small">
        Small
      </Button>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button States
// Shows default, disabled, and disabledAltState for each variant.
// Mirrors the Angular "Button States" story from the SOL Storybook.
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonStates: Story = {
  name: 'Button States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Primary row */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="primary">Default</Button>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" disabledAltState>Alt Disabled</Button>
      </div>
      {/* Secondary row */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" disabled>Disabled</Button>
        <Button variant="secondary" disabledAltState>Alt Disabled</Button>
      </div>
      {/* Tertiary row */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="tertiary">Default</Button>
        <Button variant="tertiary" disabled>Disabled</Button>
        <Button variant="tertiary" disabledAltState>Alt Disabled</Button>
      </div>
      {/* Critical row */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button variant="critical">Default</Button>
        <Button variant="critical" disabled>Disabled</Button>
        <Button variant="critical" disabledAltState>Alt Disabled</Button>
      </div>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Button Icon
// Shows buttons with icons: leading icon + text, trailing icon + text,
// and icon-only variants (square button; ariaLabel required for accessibility).
// Mirrors the Angular "Button Icon" story from the SOL Storybook.
// ─────────────────────────────────────────────────────────────────────────────
export const ButtonIcon: Story = {
  name: 'Button Icon',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Leading icon + text */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary" icon={<PlusIcon />}>
          Button Text
        </Button>
        <Button variant="secondary" icon={<PlusIcon />}>
          Button Text
        </Button>
        <Button variant="tertiary" icon={<PlusIcon />}>
          Button Text
        </Button>
      </div>

      {/* Icon-only buttons — ariaLabel is required for screen-reader accessibility */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button
          variant="primary"
          icon={<PlusIcon />}
          ariaLabel="Icon only"
        />
        <Button
          variant="secondary"
          icon={<PlusIcon />}
          ariaLabel="Custom tooltip icon only text"
        />
      </div>
    </div>
  ),
};
