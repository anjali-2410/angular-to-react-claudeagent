'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch, SwitchChangeEvent } from '../Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch/Examples',
  component: Switch,
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'large'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    symbol: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

/* ── Switch (interactive) ─────────────────────────────────────────── */

const SwitchToggleDemo = (args: any) => {
  const [checked, setChecked] = useState(args.checked ?? false);
  return (
    <div style={{ padding: '16px' }}>
      <header><h1 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Switch Demo</h1></header>
      <main>
        <Switch
          {...args}
          checked={checked}
          onCheckedChange={(e: SwitchChangeEvent) => setChecked(e.checked)}
        />
      </main>
    </div>
  );
};

export const SwitchToggle: Story = {
  name: 'Switch',
  render: (args) => <SwitchToggleDemo {...args} />,
  args: {
    name: 'hello',
    label: 'Switch Toggle Title',
    checked: false,
    symbol: true,
    size: 'large',
    disabled: false,
    readonly: false,
    required: false,
    ariaLabel: 'my Label',
    toggleId: 'toggleId',
  },
};

/* ── All States ───────────────────────────────────────────────────── */

export const AllStates: Story = {
  name: 'All States',
  render: () => (
    <div style={{ padding: '16px' }}>
      <header><h1 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>All Switch Toggle States</h1></header>
      <main>
        <h2 style={{ fontSize: '1rem', margin: '12px 0 8px' }}>Large</h2>
        <p style={{ marginBottom: '8px' }}>Without Icon</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Switch symbol={false} size="large" checked={true}  ariaLabel="checked label no icon" label="Label" />
          <Switch symbol={false} size="large" checked={false} ariaLabel="unchecked label no icon" label="Label" />
          <Switch symbol={false} size="large" checked={true}  disabled={true} ariaLabel="checked disabled no icon" label="Label" />
          <Switch symbol={false} size="large" checked={false} disabled={true} ariaLabel="unchecked disabled no icon" label="Label" />
          <Switch symbol={false} size="large" checked={true}  readonly={true} ariaLabel="readonly checked" label="Label" />
          <Switch symbol={false} size="large" checked={false} readonly={true} ariaLabel="readonly unchecked" label="Label" />
        </div>
        <p style={{ marginBottom: '8px' }}>With Icon</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Switch symbol={true} size="large" checked={true}  ariaLabel="checked with icon" label="Label" />
          <Switch symbol={true} size="large" checked={false} ariaLabel="unchecked with icon" label="Label" />
          <Switch symbol={true} size="large" checked={true}  disabled={true} ariaLabel="checked disabled with icon" label="Label" />
          <Switch symbol={true} size="large" checked={false} disabled={true} ariaLabel="unchecked disabled with icon" label="Label" />
          <Switch symbol={true} size="large" checked={true}  readonly={true} ariaLabel="readonly checked with icon" label="Label" />
          <Switch symbol={true} size="large" checked={false} readonly={true} ariaLabel="readonly unchecked with icon" label="Label" />
        </div>

        <h2 style={{ fontSize: '1rem', margin: '12px 0 8px' }}>Small</h2>
        <p style={{ marginBottom: '8px' }}>Without Icon</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Switch symbol={false} size="small" checked={true}  ariaLabel="checked small no icon" label="Label" />
          <Switch symbol={false} size="small" checked={false} ariaLabel="unchecked small no icon" label="Label" />
          <Switch symbol={false} size="small" checked={true}  disabled={true} ariaLabel="checked disabled small no icon" label="Label" />
          <Switch symbol={false} size="small" checked={false} disabled={true} ariaLabel="unchecked disabled small no icon" label="Label" />
          <Switch symbol={false} size="small" checked={true}  readonly={true} ariaLabel="readonly checked small" label="Label" />
          <Switch symbol={false} size="small" checked={false} readonly={true} ariaLabel="readonly unchecked small" label="Label" />
        </div>
        <p style={{ marginBottom: '8px' }}>With Icon</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Switch symbol={true} size="small" checked={true}  ariaLabel="checked small with icon" label="Label" />
          <Switch symbol={true} size="small" checked={false} ariaLabel="unchecked small with icon" label="Label" />
          <Switch symbol={true} size="small" checked={true}  disabled={true} ariaLabel="checked disabled small with icon" label="Label" />
          <Switch symbol={true} size="small" checked={false} disabled={true} ariaLabel="unchecked disabled small with icon" label="Label" />
          <Switch symbol={true} size="small" checked={true}  readonly={true} ariaLabel="readonly checked small with icon" label="Label" />
          <Switch symbol={true} size="small" checked={false} readonly={true} ariaLabel="readonly unchecked small with icon" label="Label" />
        </div>
      </main>
    </div>
  ),
};

/* ── Controlled (NgModel equivalent) ─────────────────────────────── */

const NgModelDemo = (args: any) => {
  const [value, setValue] = useState(false);
  return (
    <div style={{ padding: '16px' }}>
      <header><h1 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Switch Toggle — Controlled</h1></header>
      <main>
        <Switch
          {...args}
          checked={value}
          onCheckedChange={(e: SwitchChangeEvent) => setValue(e.checked)}
        />
        <br /><br />
        <p>Value: <strong>{String(value)}</strong></p>
      </main>
    </div>
  );
};

export const NgModel: Story = {
  name: 'Controlled (NgModel)',
  render: (args) => <NgModelDemo {...args} />,
  args: {
    name: 'hello',
    symbol: true,
    size: 'large',
    disabled: false,
    required: true,
    label: 'Slide Title',
  },
};

/* ── Reactive Form (controlled + external toggle) ────────────────── */

const ReactiveFormDemo = () => {
  const [value, setValue] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ padding: '16px' }}>
      <header><h1 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Switch Reactive Form</h1></header>
      <main>
        <Switch
          label="Switch in a reactive form"
          checked={value}
          disabled={disabled}
          symbol={true}
          size="large"
          required={true}
          onCheckedChange={(e: SwitchChangeEvent) => setValue(e.checked)}
        />
        <br />
        <button type="button" onClick={() => setDisabled((d) => !d)}>
          Toggle disabled state
        </button>
        <button type="button" disabled={!value} style={{ marginLeft: '8px' }}>
          submit
        </button>
        <p>Form value: <strong>{JSON.stringify({ slideToggle: value })}</strong></p>
      </main>
    </div>
  );
};

export const ReactiveForm: Story = {
  name: 'Reactive Form',
  render: () => <ReactiveFormDemo />,
};
