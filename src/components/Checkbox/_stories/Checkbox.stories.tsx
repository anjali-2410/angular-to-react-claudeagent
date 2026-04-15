import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { Checkbox } from '../Checkbox';

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
