import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { Button } from '../Button/Button';
import './Conversation.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Suggestion {
  label: string;
  tooltipText?: string;
}

export interface ConversationPromptProps {
  /** Textarea placeholder text */
  placeholder?: string;
  /** Maximum rows before textarea scrolls */
  maxRows?: number;
  /** Show character count below the prompt */
  showCharacterCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** id applied to the textarea element */
  textAreaId?: string;
  /** Static list of suggestion items */
  suggestions?: Suggestion[];
  /** Async callback to fetch suggestions on demand */
  fetchSuggestions?: () => Promise<Suggestion[]>;
  /** Controlled textarea value */
  value?: string;
  /** Show/hide the Pixie (AI) icon button */
  showPixieIcon?: boolean;
  // Translated string props (replaces Angular TranslationService)
  clearLabel?: string;
  submitLabel?: string;
  pixieLabel?: string;
  suggestionTitle?: string;
  loadErrorMessage?: string;
  retryLabel?: string;
  /** Emitted when the submit button is clicked — value is cleared after emit */
  onActionButtonClicked?: (value: string) => void;
  /** Emitted on every textarea change */
  onChange?: (value: string) => void;
}

// ── SVG icons (inlined from Angular template) ─────────────────────────────────

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4.41058 4.41107C4.73602 4.08563 5.26366 4.08563 5.58909 4.41107L9.99984 8.82181L14.4106 4.41107C14.736 4.08563 15.2637 4.08563 15.5891 4.41107C15.9145 4.73651 15.9145 5.26414 15.5891 5.58958L11.1783 10.0003L15.5891 14.4111C15.9145 14.7365 15.9145 15.2641 15.5891 15.5896C15.2637 15.915 14.736 15.915 14.4106 15.5896L9.99984 11.1788L5.58909 15.5896C5.26366 15.915 4.73602 15.915 4.41058 15.5896C4.08514 15.2641 4.08514 14.7365 4.41058 14.4111L8.82133 10.0003L4.41058 5.58958C4.08514 5.26414 4.08514 4.73651 4.41058 4.41107Z" />
  </svg>
);

const PixieIcon = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M8.32 6.72v0l2.080-1.12c0.16 0 0.16-0.16 0.16-0.32s-0.16-0.32-0.16-0.32l-2.080-1.12c-0.64-0.32-1.28-0.8-1.6-1.44l-0.96-2.24c-0.16 0-0.32-0.16-0.48-0.16s-0.32 0.16-0.32 0.16l-1.12 2.24c-0.32 0.64-0.8 1.12-1.44 1.44l-2.24 1.12c0 0-0.16 0.16-0.16 0.32s0.16 0.32 0.16 0.32l2.080 1.12c0.64 0.32 1.12 0.8 1.44 1.44l1.12 2.080c0 0.16 0.16 0.16 0.32 0.16s0.32-0.16 0.32-0.16l1.12-2.080c0.48-0.48 1.12-1.12 1.76-1.44zM31.52 18.72l-4.96-2.56c-1.44-0.8-2.72-1.92-3.52-3.52l-2.56-4.96c-0.16-0.32-0.48-0.48-0.8-0.48s-0.64 0.16-0.8 0.48l-2.56 4.96c-0.8 1.44-1.92 2.72-3.52 3.52v0l-4.96 2.56c-0.32 0.16-0.48 0.48-0.48 0.8s0.16 0.64 0.48 0.8l4.96 2.56c1.44 0.8 2.72 1.92 3.52 3.52l2.56 4.96c0.16 0.32 0.48 0.48 0.8 0.48s0.64-0.16 0.8-0.48l2.56-4.96c0.8-1.44 1.92-2.72 3.52-3.52l4.96-2.56c0.32-0.16 0.48-0.48 0.48-0.8s-0.16-0.64-0.48-0.8z" />
  </svg>
);

const SubmitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M0.00761904 15.2L16 8.00005L0.00761904 0.800049L0 6.40005L11.4286 8.00005L0 9.60005L0.00761904 15.2Z" fill="currentColor" />
  </svg>
);

const RetryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M13.09 4.64322H10.15C9.8 4.64322 9.59 4.36181 9.59 4.01005C9.59 3.65829 9.87 3.37688 10.15 3.44724H11.34C10.29 2.1809 8.75 1.33668 7 1.33668C3.92 1.33668 1.4 3.86935 1.4 6.96482C1.4 10.0603 3.92 12.593 7 12.593C10.08 12.593 12.6 10.0603 12.6 6.96482H14C14 10.8342 10.85 14 7 14C3.15 14 0 10.9045 0 7.03518C0 3.16583 3.15 0 7 0C9.24 0 11.2 1.05528 12.53 2.74372V1.12563C12.53 0.773869 12.81 0.492462 13.09 0.562814C13.37 0.562814 13.65 0.773869 13.65 1.12563V4.15075C13.65 4.43216 13.37 4.71357 13.09 4.64322Z" fill="#003D7A" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const ConversationPrompt: React.FC<ConversationPromptProps> = ({
  placeholder = '',
  maxRows = 4,
  showCharacterCount = false,
  maxLength = 200,
  textAreaId = '',
  suggestions = [],
  fetchSuggestions,
  value: valueProp = '',
  showPixieIcon = true,
  clearLabel = 'Clear',
  submitLabel = 'Submit',
  pixieLabel = 'Suggestions',
  suggestionTitle = 'Suggestions',
  loadErrorMessage = 'Failed to load suggestions',
  retryLabel = 'Retry',
  onActionButtonClicked,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(valueProp);
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsLoadError, setSuggestionsLoadError] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>(suggestions);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external value prop
  useEffect(() => { setInputValue(valueProp); }, [valueProp]);

  // Sync static suggestions prop
  useEffect(() => { setActiveSuggestions(suggestions); }, [suggestions]);

  // Auto-resize textarea (mirrors sol-text-area maxRows behaviour)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
    const paddingBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputValue, maxRows]);

  // @floating-ui for suggestions dropdown
  const { refs, floatingStyles } = useFloating({
    open: openMenu,
    placement: 'top-end',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const ref = refs.reference.current as Element | null;
      const floating = refs.floating.current;
      if (ref && !ref.contains(e.target as Node) &&
          floating && !floating.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu, refs]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setOpenMenu(false);
    setInputValue(val);
    onChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    onActionButtonClicked?.(inputValue);
    setInputValue('');
    onChange?.('');
  }, [inputValue, onActionButtonClicked, onChange]);

  const handleClear = () => {
    setOpenMenu(false);
    setInputValue('');
    onChange?.('');
  };

  const handlePixieClick = useCallback(async () => {
    setOpenMenu(true);

    if (!fetchSuggestions) return;

    setIsLoadingSuggestions(true);
    setSuggestionsLoadError(false);
    setActiveSuggestions([]);

    try {
      const data = await fetchSuggestions();
      setActiveSuggestions(data ?? []);
    } catch {
      setSuggestionsLoadError(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [fetchSuggestions]);

  const handleItemClicked = (item: Suggestion) => {
    const truncated = maxLength !== undefined && item.label.length > maxLength
      ? item.label.slice(0, maxLength)
      : item.label;
    setInputValue(truncated);
    onChange?.(truncated);
    setOpenMenu(false);
    textareaRef.current?.focus();
  };

  const hasValue = inputValue.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="sol-conversation-prompt">
      <div className="prompt-container">
        <div className="prompt-wrapper" ref={refs.setReference as React.Ref<HTMLDivElement>}>
          {/* Textarea */}
          <div className="input-container">
            <textarea
              ref={textareaRef}
              id={textAreaId || undefined}
              className="sol-conversation-textarea"
              placeholder={placeholder}
              value={inputValue}
              maxLength={maxLength}
              rows={1}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={() => setOpenMenu(false)}
            />
          </div>

          {/* Inner action buttons */}
          <div className="inner-actions-container">
            {/* Clear button */}
            <span className="clear-icon" style={{ visibility: hasValue ? 'visible' : 'hidden' }}>
              <Button
                variant="tertiary"
                size="medium"
                ariaLabel={clearLabel}
                icon={<ClearIcon />}
                onClick={handleClear}
              />
            </span>

            {/* Pixie button */}
            {showPixieIcon && (
              <span className="pixie-icon">
                <Button
                  variant="tertiary"
                  size="medium"
                  ariaLabel={pixieLabel}
                  icon={<PixieIcon />}
                  onClick={handlePixieClick}
                />
              </span>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="submit-btn-container">
          <Button
            variant={hasValue ? 'primary' : 'secondary'}
            size="large"
            ariaLabel={submitLabel}
            disabled={!hasValue}
            icon={<SubmitIcon />}
            onClick={handleSubmit}
          />
        </div>
      </div>

      {/* Character counter */}
      {showCharacterCount && maxLength !== undefined && (
        <div className="character-counter">
          {inputValue.length}/{maxLength}
        </div>
      )}

      {/* Suggestions dropdown */}
      {openMenu && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="sol-suggestion-menu-box"
          role="dialog"
          aria-label={suggestionTitle}
        >
          {/* Header */}
          <div className="suggestion-cls-header">
            <span className="title-cls">
              <span className="text-cls">
                <PixieIcon />
              </span>
              {suggestionTitle}
            </span>
          </div>

          {/* Loading */}
          {isLoadingSuggestions && (
            <div className="sol-suggestion-loading">
              <span className="sol-conversation-spinner" aria-label="Loading suggestions" role="status" />
            </div>
          )}

          {/* Error */}
          {!isLoadingSuggestions && suggestionsLoadError && (
            <div className="sol-suggestion-error">
              <div className="error-text">{loadErrorMessage}</div>
              <Button
                variant="secondary"
                size="large"
                ariaLabel={retryLabel}
                icon={<RetryIcon />}
                onClick={handlePixieClick}
              >
                {retryLabel}
              </Button>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoadingSuggestions && !suggestionsLoadError && (
            <div className="suggestions-with-scroll">
              {activeSuggestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  className={`sol-menu-item suggestion-box-style${item.label.length <= 50 ? ' suggestion-normal-height' : ''}`}
                  onClick={() => handleItemClicked(item)}
                >
                  <span className="sol-menu-item-text" title={item.label}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
