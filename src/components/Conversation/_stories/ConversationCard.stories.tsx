/**
 * Conversation Card demo story — converted from conversation-card.stories.ts
 * The Angular story built a complex demo with a full conversation panel.
 * This React version demonstrates the same concept using our Card + ConversationPrompt.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState, useRef } from 'react';
import { ConversationPrompt } from '../ConversationPrompt';
import { Card, CardBody, CardFooter } from '../../Card/Card';
import { Button } from '../../Button/Button';

interface ConversationCard {
  type: 'sol-conversation-question' | 'sol-conversation-response';
  content: string;
  timestamp: string;
}

const PixieIconSmall = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
    <path fill="#007cbe" d="M8.32 6.72v0l2.080-1.12c0.16 0 0.16-0.16 0.16-0.32s-0.16-0.32-0.16-0.32l-2.080-1.12c-0.64-0.32-1.28-0.8-1.6-1.44l-0.96-2.24c-0.16 0-0.32-0.16-0.48-0.16s-0.32 0.16-0.32 0.16l-1.12 2.24c-0.32 0.64-0.8 1.12-1.44 1.44l-2.24 1.12c0 0-0.16 0.16-0.16 0.32s0.16 0.32 0.16 0.32l2.080 1.12c0.64 0.32 1.12 0.8 1.44 1.44l1.12 2.080c0 0.16 0.16 0.16 0.32 0.16s0.32-0.16 0.32-0.16l1.12-2.080c0.48-0.48 1.12-1.12 1.76-1.44zM31.52 18.72l-4.96-2.56c-1.44-0.8-2.72-1.92-3.52-3.52l-2.56-4.96c-0.16-0.32-0.48-0.48-0.8-0.48s-0.64 0.16-0.8 0.48l-2.56 4.96c-0.8 1.44-1.92 2.72-3.52 3.52v0l-4.96 2.56c-0.32 0.16-0.48 0.48-0.48 0.8s0.16 0.64 0.48 0.8l4.96 2.56c1.44 0.8 2.72 1.92 3.52 3.52l2.56 4.96c0.16 0.32 0.48 0.48 0.8 0.48s0.64-0.16 0.8-0.48l2.56-4.96c0.8-1.44 1.92-2.72 3.52-3.52l4.96-2.56c0.32-0.16 0.48-0.48 0.48-0.8s-0.16-0.64-0.48-0.8z" />
  </svg>
);

function ConversationDemo({
  placeholder,
  showCharacterCount,
  maxLength,
  suggestions,
}: {
  placeholder: string;
  showCharacterCount: boolean;
  maxLength: number;
  suggestions: Array<{ label: string }>;
}) {
  const [cards, setCards] = useState<ConversationCard[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const scrollToBottom = () => {
    setTimeout(() => {
      if (panelRef.current) {
        panelRef.current.scrollTop = panelRef.current.scrollHeight;
      }
    }, 0);
  };

  const addQuestion = (prompt: string) => {
    setCards(prev => [...prev, { type: 'sol-conversation-question', content: prompt, timestamp: getTimestamp() }]);
    action('question submitted')(prompt);
    scrollToBottom();
  };

  const addResponse = () => {
    const response: ConversationCard = {
      type: 'sol-conversation-response',
      content: 'You can ask anything you want.',
      timestamp: getTimestamp(),
    };
    setCards(prev => [...prev, response]);
    action('response added')();
    scrollToBottom();
  };

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: '1 1 auto' }}>
        <h1>Conversation</h1>
        <h2 style={{ marginTop: '5rem' }}>Add Response</h2>
        <Button onClick={addResponse}>Add Response</Button>
        <h2 style={{ marginTop: '7rem' }}>Ask Question</h2>
        <div style={{ maxWidth: '50vw', marginBottom: '3rem' }}>
          <ConversationPrompt
            placeholder={placeholder}
            suggestions={suggestions}
            showCharacterCount={showCharacterCount}
            maxLength={maxLength}
            onActionButtonClicked={addQuestion}
          />
        </div>
      </div>

      <div
        ref={panelRef}
        style={{ width: 424, border: '1px solid #CCC', padding: '2vh', height: '86vh', overflowY: 'auto' }}
      >
        {cards.length > 0 && (
          <div className="sol-conversation">
            {cards.map((card, i) => (
              <div key={i} className={card.type}>
                <Card>
                  <CardBody>
                    {card.type === 'sol-conversation-response' && <PixieIconSmall />}
                    <div dangerouslySetInnerHTML={{ __html: card.content }} />
                  </CardBody>
                  <CardFooter>
                    <div className="sol-conversation-card-timestamp">{card.timestamp}</div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Components/Conversation UI/Examples',
};

export default meta;
interface CardDemoArgs {
  placeholder: string;
  maxRows: number;
  showCharacterCount: boolean;
  maxLength: number;
  suggestions: Array<{ label: string }>;
}

type Story = StoryObj<CardDemoArgs>;

export const ConversationCardDemo: Story = {
  name: 'ConversationCardDemo',
  args: {
    placeholder: 'Ask a question or request...',
    maxRows: 3,
    showCharacterCount: true,
    maxLength: 300,
    suggestions: [
      { label: 'What are the top 10 call reasons?' },
      { label: 'Show me 10 agents with highest AHT?' },
    ],
  },
  render: args => (
    <ConversationDemo
      placeholder={args.placeholder}
      showCharacterCount={args.showCharacterCount}
      maxLength={args.maxLength}
      suggestions={args.suggestions}
    />
  ),
};
