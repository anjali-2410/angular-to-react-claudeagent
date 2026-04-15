import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox/Overview',
  component: Checkbox,
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    docs: { disable: false },
  },
  tags: ['hidden', 'docs-only'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ── Single checkbox variants ───────────────────────────────────────────────

export const checkbox: Story = {
  name: 'Default Checkbox',
  render: () => <Checkbox />,
};

export const labelCheckbox: Story = {
  name: 'labelCheckbox',
  render: () => <Checkbox value="label" label="label" />,
};

export const ngContentCheckbox: Story = {
  name: 'ngContentCheckbox',
  render: () => <Checkbox value="label">label content</Checkbox>,
};

export const customContentCheckbox: Story = {
  name: 'customContentCheckbox',
  render: () => (
    <Checkbox
      value="label"
      customContent={<span style={{ fontWeight: 'bold', color: '#333' }}>Custom template content</span>}
    />
  ),
};

export const disabledLabelCheckbox: Story = {
  name: 'disabledLabelCheckbox',
  render: () => <Checkbox value="label" disabled label="label" />,
};

export const readonlyLabelCheckbox: Story = {
  name: 'readonlyLabelCheckbox',
  render: () => <Checkbox value="label" readonly label="label" />,
};

export const checkedCheckbox: Story = {
  name: 'checkedCheckbox',
  render: () => <Checkbox value="label" checked label="label" />,
};

export const requiredCheckbox: Story = {
  name: 'requiredCheckbox',
  render: () => <Checkbox value="label" label="label" required />,
};

export const indeterminateCheckbox: Story = {
  name: 'indeterminateCheckbox',
  render: () => <Checkbox value="label" indeterminate checked label="label" />,
};

// ── Checkbox Group variants ────────────────────────────────────────────────

export const groupCheckbox: Story = {
  name: 'groupCheckbox',
  render: () => (
    <CheckboxGroup label="Checkbox group">
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};

export const groupSelectedCheckbox: Story = {
  name: 'groupSelectedCheckbox',
  render: () => (
    <CheckboxGroup label="Checkbox group" value={['option1']}>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};

export const groupReadonlyCheckbox: Story = {
  name: 'groupReadonlyCheckbox',
  render: () => (
    <CheckboxGroup label="Checkbox group" readonly value={['option1']}>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};

export const groupDisabledCheckbox: Story = {
  name: 'groupDisabledCheckbox',
  render: () => (
    <CheckboxGroup label="Checkbox group" disabled value={['option1']}>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};

export const groupRequiredCheckbox: Story = {
  name: 'groupRequiredCheckbox',
  render: () => (
    <CheckboxGroup label="Checkbox group" required value={['option1']}>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};
