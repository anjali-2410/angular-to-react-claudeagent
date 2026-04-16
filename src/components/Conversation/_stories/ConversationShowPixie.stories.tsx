/**
 * Show/Hide Pixie Icon story — converted from showPixieIcon.stories.ts
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { ConversationPrompt } from '../ConversationPrompt';

const meta: Meta<typeof ConversationPrompt> = {
  title: 'Components/Conversation UI/Examples',
  component: ConversationPrompt,
};

export default meta;
type Story = StoryObj<typeof ConversationPrompt>;

export const ShowPixieIcon: Story = {
  name: 'ShowPixieIcon',
  args: {
    placeholder: 'Ask a question or request....',
    showPixieIcon: false,
    showCharacterCount: false,
    suggestions: [
      { label: 'What are the top 10 call reasons?' },
      { label: 'Show me 10 agents with highest AHT?' },
    ],
  },
  render: args => (
    <main>
      <h1 className="heading">Show/Hide Pixie Icon</h1>
      <ConversationPrompt {...args} onActionButtonClicked={action('Clicked')} />
    </main>
  ),
};
