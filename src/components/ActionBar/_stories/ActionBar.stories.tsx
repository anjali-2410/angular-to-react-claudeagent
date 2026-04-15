/**
 * ActionBar stories — converted from action-bar.component.stories.ts
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { ActionBar } from '../ActionBar';

const meta: Meta<typeof ActionBar> = {
  title: 'Components/Action Bar',
  component: ActionBar,
  argTypes: {
    showActionBar: { control: 'boolean' },
    actionBarTextContent: { control: 'text' },
    buttonText: { control: 'text' },
    buttonIcon: { control: 'text' },
    ariaLabel: { control: 'text' },
    liveMessage: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const ActionBarStory: Story = {
  name: 'ActionBar',
  args: {
    showActionBar: true,
    ariaLabel: 'Action bar',
    actionBarTextContent: 'You are currently impersonating Darth Vader on tenant Galactic Empire',
    buttonText: 'Stop',
    buttonIcon: 'stopIcon',
    styleData: 'width: 0.75rem; height: 0.75rem; background-color: var(--sol-color-text-default);',
    liveMessage: false,
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Action bar</h1>
      <ActionBar {...args} onButtonClicked={action('stop button clicked')} />
    </main>
  ),
};
