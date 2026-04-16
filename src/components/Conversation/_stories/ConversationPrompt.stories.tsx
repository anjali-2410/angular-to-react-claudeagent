/**
 * ConversationPrompt basic story — converted from conversation-prompt.stories.ts
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { ConversationPrompt } from '../ConversationPrompt';

const meta: Meta<typeof ConversationPrompt> = {
  title: 'Components/Conversation UI/Examples',
  component: ConversationPrompt,
  argTypes: {
    fetchSuggestions: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ConversationPrompt>;

export const ConversationPromptBasic: Story = {
  name: 'ConversationPromptBasic',
  args: {
    placeholder: 'Ask a question or request....',
    maxRows: 3,
    showCharacterCount: true,
    maxLength: 200,
    suggestions: [
      { label: 'What are the top 10 call reasons?', tooltipText: 'Suggestion 1' },
      { label: 'Show me 10 agents with highest AHT?', tooltipText: 'Suggestion 2' },
    ],
  },
  render: args => (
    <main>
      <header>
        <h1 className="heading"><label htmlFor="conversation-prompt-textarea">Conversation Prompt</label></h1>
      </header>
      <ConversationPrompt
        {...args}
        textAreaId="conversation-prompt-textarea"
        onActionButtonClicked={action('Clicked')}
      />
    </main>
  ),
};
