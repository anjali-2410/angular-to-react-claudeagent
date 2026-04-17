'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch/OverviewExamples',
  component: Switch,
  tags: ['hidden', 'docs-only'],
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Small: Story = {
  name: 'Small',
  render: () => (
    <Switch checked={false} symbol={true} size="small" ariaLabel="small switch" label="Small Switch" />
  ),
};

export const Large: Story = {
  name: 'Large',
  render: () => (
    <Switch checked={false} symbol={true} size="large" ariaLabel="large switch" label="Large Switch" />
  ),
};

export const WithSymbol: Story = {
  name: 'With Symbol',
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <Switch checked={false} symbol={true} size="large" ariaLabel="unchecked with symbol" label="Unchecked" />
      <Switch checked={true}  symbol={true} size="large" ariaLabel="checked with symbol"   label="Checked" />
    </div>
  ),
};

export const WithoutSymbol: Story = {
  name: 'Without Symbol',
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <Switch checked={false} symbol={false} size="large" ariaLabel="unchecked without symbol" label="Unchecked" />
      <Switch checked={true}  symbol={false} size="large" ariaLabel="checked without symbol"   label="Checked" />
    </div>
  ),
};
