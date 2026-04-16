/**
 * Async fetch suggestions story — converted from asyncFetchSuggestions.stories.ts
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { ConversationPrompt } from '../ConversationPrompt';

const meta: Meta<typeof ConversationPrompt> = {
  title: 'Components/Conversation UI/Examples',
  component: ConversationPrompt,
  argTypes: { fetchSuggestions: { control: false } },
};

export default meta;
type Story = StoryObj<typeof ConversationPrompt>;

export const AsyncFetchSuggestion: Story = {
  name: 'AsyncFetchSuggestion',
  args: {
    placeholder: 'Ask a question or request....',
    showPixieIcon: true,
    showCharacterCount: true,
    fetchSuggestions: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
      return [
        { label: 'Show me the best 10 agents based on being empathetic to customers compared to my industry for last month?', tooltipText: 'test 1' },
        { label: 'What days of the week have the highest abandon rate?', tooltipText: 'test 2' },
      ];
    },
  },
  render: args => (
    <main>
      <h1 className="heading">Async Fetch Suggestions</h1>
      <ConversationPrompt
        {...args}
        onActionButtonClicked={action('Clicked')}
      />
    </main>
  ),
};
