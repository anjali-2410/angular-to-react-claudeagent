import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label/Examples',
  component: Label,
  argTypes: {
    label: { control: 'text' },
    labelHelpText: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  name: 'Default',
  render: (args) => (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <main>
        <h1 className="sol-screenreader-only">Label</h1>
        <div>
          <Label {...args} />
        </div>
      </main>
    </div>
  ),
  args: {
    label: 'Default Label',
    labelHelpText: 'Info about this label',
    required: true,
    readonly: false,
    disabled: false,
  },
};
