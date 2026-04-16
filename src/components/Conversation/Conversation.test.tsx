import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConversationPrompt } from './ConversationPrompt';

describe('ConversationPrompt', () => {
  describe('basic rendering', () => {
    it('renders without errors', () => {
      render(<ConversationPrompt />);
      expect(document.querySelector('.sol-conversation-prompt')).toBeTruthy();
    });

    it('renders a textarea', () => {
      render(<ConversationPrompt />);
      expect(document.querySelector('.sol-conversation-textarea')).toBeTruthy();
    });

    it('applies placeholder text', () => {
      render(<ConversationPrompt placeholder="Ask a question..." />);
      expect(screen.getByPlaceholderText('Ask a question...')).toBeTruthy();
    });

    it('applies textAreaId to the textarea', () => {
      render(<ConversationPrompt textAreaId="my-textarea" />);
      expect(document.getElementById('my-textarea')).toBeTruthy();
    });
  });

  describe('input value', () => {
    it('reflects controlled value prop', () => {
      render(<ConversationPrompt value="Hello world" />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      expect(ta.value).toBe('Hello world');
    });

    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<ConversationPrompt onChange={handler} />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      await user.type(ta, 'hi');
      expect(handler).toHaveBeenCalled();
    });

    it('updates internal value as user types', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      await user.type(ta, 'test');
      expect(ta.value).toBe('test');
    });
  });

  describe('clear button', () => {
    it('clear button is hidden when input is empty', () => {
      render(<ConversationPrompt />);
      const clear = document.querySelector('.clear-icon') as HTMLElement;
      expect(clear.style.visibility).toBe('hidden');
    });

    it('clear button is visible when input has value', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      await user.type(ta, 'test');
      const clear = document.querySelector('.clear-icon') as HTMLElement;
      expect(clear.style.visibility).toBe('visible');
    });

    it('clears the input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt value="test" />);
      const clearBtn = document.querySelector('.clear-icon button') as HTMLElement;
      await user.click(clearBtn);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      expect(ta.value).toBe('');
    });
  });

  describe('submit', () => {
    it('submit button is disabled when input is empty', () => {
      render(<ConversationPrompt />);
      const btn = screen.getByRole('button', { name: 'Submit' });
      expect(btn).toBeDisabled();
    });

    it('submit button is enabled when input has value', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      await user.type(ta, 'hello');
      const btn = screen.getByRole('button', { name: 'Submit' });
      expect(btn).not.toBeDisabled();
    });

    it('calls onActionButtonClicked with input value and clears on submit', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<ConversationPrompt onActionButtonClicked={handler} />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      await user.type(ta, 'my question');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handler).toHaveBeenCalledWith('my question');
      expect(ta.value).toBe('');
    });

    it('submits on Enter key (without Shift)', async () => {
      const handler = vi.fn();
      render(<ConversationPrompt value="question" onActionButtonClicked={handler} />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      fireEvent.keyDown(ta, { key: 'Enter', shiftKey: false });
      expect(handler).toHaveBeenCalledWith('question');
    });

    it('does NOT submit on Shift+Enter', async () => {
      const handler = vi.fn();
      render(<ConversationPrompt value="question" onActionButtonClicked={handler} />);
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('character counter', () => {
    it('is hidden by default', () => {
      render(<ConversationPrompt />);
      expect(document.querySelector('.character-counter')).toBeNull();
    });

    it('shows character count when showCharacterCount=true', () => {
      render(<ConversationPrompt showCharacterCount maxLength={200} value="hello" />);
      expect(screen.getByText('5/200')).toBeTruthy();
    });
  });

  describe('pixie icon', () => {
    it('shows pixie button by default', () => {
      render(<ConversationPrompt />);
      expect(screen.getByLabelText('Suggestions')).toBeTruthy();
    });

    it('hides pixie button when showPixieIcon=false', () => {
      render(<ConversationPrompt showPixieIcon={false} />);
      expect(screen.queryByLabelText('Suggestions')).toBeNull();
    });

    it('opens suggestions menu when pixie button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt suggestions={[{ label: 'Top 10 calls' }]} />);
      await user.click(screen.getByLabelText('Suggestions'));
      expect(document.querySelector('.sol-suggestion-menu-box')).toBeTruthy();
    });

    it('shows suggestion items in the menu', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt suggestions={[{ label: 'Top 10 calls' }, { label: 'Best agents' }]} />);
      await user.click(screen.getByLabelText('Suggestions'));
      expect(screen.getByText('Top 10 calls')).toBeTruthy();
      expect(screen.getByText('Best agents')).toBeTruthy();
    });

    it('fills input when suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationPrompt suggestions={[{ label: 'Top calls' }]} />);
      await user.click(screen.getByLabelText('Suggestions'));
      await user.click(screen.getByText('Top calls'));
      const ta = document.querySelector('.sol-conversation-textarea') as HTMLTextAreaElement;
      expect(ta.value).toBe('Top calls');
      expect(document.querySelector('.sol-suggestion-menu-box')).toBeNull();
    });
  });

  describe('async fetch suggestions', () => {
    it('shows loading spinner while fetching', async () => {
      const user = userEvent.setup();
      let resolve: (v: unknown) => void;
      const fetchSuggestions = () => new Promise(r => { resolve = r; }) as Promise<never>;
      render(<ConversationPrompt fetchSuggestions={fetchSuggestions} />);
      await user.click(screen.getByLabelText('Suggestions'));
      expect(document.querySelector('.sol-conversation-spinner')).toBeTruthy();
      resolve!([]);
    });

    it('shows error state when fetch fails', async () => {
      const user = userEvent.setup();
      const fetchSuggestions = () => Promise.reject(new Error('fail'));
      render(<ConversationPrompt fetchSuggestions={fetchSuggestions} loadErrorMessage="Could not load" />);
      await user.click(screen.getByLabelText('Suggestions'));
      await waitFor(() => {
        expect(screen.getByText('Could not load')).toBeTruthy();
      });
    });

    it('shows fetched suggestions after successful fetch', async () => {
      const user = userEvent.setup();
      const fetchSuggestions = () => Promise.resolve([{ label: 'Fetched item' }]);
      render(<ConversationPrompt fetchSuggestions={fetchSuggestions} />);
      await user.click(screen.getByLabelText('Suggestions'));
      await waitFor(() => {
        expect(screen.getByText('Fetched item')).toBeTruthy();
      });
    });
  });
});
