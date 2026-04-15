import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox/Examples',
  component: Checkbox,
  argTypes: {
    checkboxId: { control: 'text' },
    label: { control: 'text' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    ariaLabelledby: { control: 'text' },
    ariaDescribedby: { control: 'text' },
    errorState: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const CheckboxStory: Story = {
  name: 'Checkbox',
  args: {
    checkboxId: '',
    label: 'Checkbox',
    checked: false,
    indeterminate: false,
    required: false,
    readonly: false,
    disabled: false,
    ariaLabel: '',
    ariaLabelledby: null,
    ariaDescribedby: '',
    errorState: false,
    errorMessage: '',
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Checkbox</h1>
      <Checkbox
        {...args}
        onCheckedChange={action('checkedChange')}
        onIndeterminateChange={action('indeterminateChange')}
        onClicked={action('clicked')}
        onFocus={action('focus')}
        onBlur={action('blur')}
      />
    </main>
  ),
};

// ── Checkbox Group stories ─────────────────────────────────────────────────

const groupMeta: Meta<typeof CheckboxGroup> = {
  title: 'Components/Checkbox Group/Examples',
  component: CheckboxGroup,
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    errorState: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
};

type GroupStory = StoryObj<typeof CheckboxGroup>;

export const CheckboxGroupWithOptions: GroupStory = {
  name: 'Checkbox Group',
  storyName: 'CheckboxGroupWithOptions',
  args: {
    disabled: false,
    required: true,
    label: 'Select options',
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Checkbox Group Demo</h1>
      <CheckboxGroup
        {...args}
        name="preferences"
        onClicked={action('click event triggered')}
      >
        <Checkbox value="option1">Option 1</Checkbox>
        <Checkbox value="option2">Option 2</Checkbox>
        <Checkbox value="option3">Option 3</Checkbox>
      </CheckboxGroup>
    </main>
  ),
};

export const CheckboxGroupWithSelected: GroupStory = {
  name: 'Checkbox Group With Pre-selected Options',
  args: {
    disabled: false,
    required: true,
    label: 'Email Preferences (Some Pre-selected)',
    value: ['option2', 'option3'],
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Checkbox Group with Pre-selected Options</h1>
      <CheckboxGroup
        {...args}
        name="options"
        onClicked={action('click event triggered')}
      >
        <Checkbox value="option1">Marketing Emails</Checkbox>
        <Checkbox value="option2">Product Updates</Checkbox>
        <Checkbox value="option3">Security Alerts</Checkbox>
        <Checkbox value="option4">Weekly Newsletter</Checkbox>
      </CheckboxGroup>
    </main>
  ),
};
