import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label/OverviewExamples',
  component: Label,
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    docs: { disable: false },
  },
  tags: ['hidden', 'docs-only'],
};
export default meta;

type Story = StoryObj<typeof Label>;

export const BasicLabel: Story = {
  name: 'Basic Label',
  render: () => <Label label="Basic Label" />,
};

export const LabelWithHelpText: Story = {
  name: 'Label with Help Text',
  render: () => (
    <Label
      label="Label with Help"
      labelHelpText="This is helpful information about this field"
    />
  ),
};

export const RequiredLabel: Story = {
  name: 'Required Label',
  render: () => <Label label="Required Label" required={true} />,
};

export const DisabledLabel: Story = {
  name: 'Disabled Label',
  render: () => <Label label="Disabled Label" disabled={true} />,
};

export const ReadonlyLabel: Story = {
  name: 'Readonly Label',
  render: () => <Label label="Readonly Label" readonly={true} required={true} />,
};
