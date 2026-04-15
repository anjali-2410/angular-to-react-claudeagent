import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import './Autocomplete.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AutocompleteOptionData {
  id: string;
  name: string;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface AutocompleteOptionSelectedEvent {
  value: string;
  id: string;
}

export interface AutocompleteProps {
  /** Minimum search text length before suggestions appear. Default: 3 */
  minimumSearchTextLength?: number;
  /** ARIA label for the input — required for accessibility */
  ariaLabel: string;
  /** ID for the autocomplete dropdown panel. Auto-generated if omitted */
  panelId?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Controlled value (search text) */
  value?: string;
  /** Called whenever the input text changes */
  onChange?: (value: string) => void;
  /** Called when an option is selected from the dropdown */
  onOptionSelected?: (event: AutocompleteOptionSelectedEvent) => void;
  /** Called when the clear button is clicked */
  onClearedSearchText?: () => void;
  /** Called when the dropdown opens (true) or closes (false) */
  onDropdownVisible?: (visible: boolean) => void;
  /** AutocompleteOption children */
  children?: React.ReactNode;
}

export interface AutocompleteHandle {
  /** Focuses the search input */
  setFocus: () => void;
  /** Clears the search text */
  clearSearchText: () => void;
}

// ---------------------------------------------------------------------------
// AutocompleteOption
// ---------------------------------------------------------------------------

export interface AutocompleteOptionProps {
  /** Unique identifier for the option */
  id: string;
  /** Display name (used as the value when selected) */
  name: string;
  /** Disabled — cannot be selected */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * AutocompleteOption — mirrors `<sol-autocomplete-option>`.
 * This is a data-only component; it renders nothing by itself.
 * The parent Autocomplete reads its props via the children API.
 */
export const AutocompleteOption: React.FC<AutocompleteOptionProps> = () => null;
AutocompleteOption.displayName = 'AutocompleteOption';

// ---------------------------------------------------------------------------
// Helper: extract option data from children
// ---------------------------------------------------------------------------

function extractOptions(children: React.ReactNode): AutocompleteOptionData[] {
  const options: AutocompleteOptionData[] = [];
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    if ((child.type as React.FC).displayName === 'AutocompleteOption') {
      const props = child.props as AutocompleteOptionProps;
      options.push({
        id: props.id,
        name: props.name,
        disabled: props.disabled ?? false,
        content: props.children,
      });
    }
  });
  return options;
}

// ---------------------------------------------------------------------------
// Helper: text highlighter (mirrors TextHighlighterPipe)
// ---------------------------------------------------------------------------

function textHighlighter(originalText: string, textToFind: string, cssClass = 'highlighter'): string {
  if (!textToFind) return originalText;
  const pattern = textToFind.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  const regex = new RegExp(pattern, 'gi');
  return originalText.replace(regex, match => `<span class="${cssClass}">${match}</span>`);
}

// ---------------------------------------------------------------------------
// SearchAutocompleteItem
// ---------------------------------------------------------------------------

export interface SearchAutocompleteItemProps {
  /** Text to display (primary label) */
  text?: string;
  /** Text to highlight within `text` */
  searchText?: string;
  /** Hierarchical path string (e.g. "Root/Parent/Child") */
  path?: string;
}

const FONT_STYLE = '12px SOL Sans';
const REMOVE_PADDING = 25;
const DELIMITER = '/';
const ELLIPSIS = '...';

/**
 * SearchAutocompleteItem — mirrors `<sol-search-autocomplete-item>`.
 * Displays text with highlighted search matches and a truncated path.
 */
export const SearchAutocompleteItem: React.FC<SearchAutocompleteItemProps> = ({
  text = '',
  searchText = '',
  path = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [presentedPath, setPresentedPath] = useState<string>(path);

  const computePath = useCallback(
    (elmWidth: number) => {
      const maxTextLength = elmWidth - REMOVE_PADDING;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.font = FONT_STYLE;

      const pathWidth = ctx.measureText(path).width;
      let result = path;

      if (maxTextLength > 0 && pathWidth >= maxTextLength) {
        const pathArray = path.split(DELIMITER);
        const prefix = pathArray[0] + DELIMITER + ELLIPSIS + DELIMITER;
        let newPath = '';
        for (let i = 2; i < pathArray.length; i++) {
          newPath = prefix + pathArray.slice(i).join(DELIMITER);
          if (maxTextLength >= ctx.measureText(newPath).width) break;
        }
        result = newPath;
      }

      setPresentedPath(result);
    },
    [path]
  );

  // Reset presented path when `path` prop changes
  useEffect(() => {
    setPresentedPath(path);
  }, [path]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver(entries => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const entry of entries) {
          computePath(entry.contentRect.width);
        }
      }, 300);
    });

    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [computePath]);

  return (
    <div className="search-item-wrapper" ref={containerRef}>
      <span
        className="search-item-text"
        dangerouslySetInnerHTML={{ __html: textHighlighter(text, searchText) }}
      />
      <span
        className="search-item-path"
        dangerouslySetInnerHTML={{ __html: presentedPath }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Autocomplete (main component)
// ---------------------------------------------------------------------------

let autocompleteCounter = 0;

export const Autocomplete = forwardRef<AutocompleteHandle, AutocompleteProps>(function Autocomplete(
  {
    minimumSearchTextLength = 3,
    ariaLabel,
    panelId: panelIdProp,
    placeholder = 'Search for item',
    value,
    onChange,
    onOptionSelected,
    onClearedSearchText,
    onDropdownVisible,
    children,
  },
  ref
) {
  const uid = useId();
  const instanceId = useRef(++autocompleteCounter);
  const resolvedPanelId = panelIdProp ?? `autocompletePanel-${uid}-${instanceId.current}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Controlled / uncontrolled input
  const isControlled = value !== undefined;
  const [internalText, setInternalText] = useState(value ?? '');
  const searchText = isControlled ? (value ?? '') : internalText;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [announcement, setAnnouncement] = useState('');

  // Extract options from children
  const options = extractOptions(children);
  const hasOptions = options.length > 0;
  const showNoItemsFound =
    !hasOptions && searchText.length >= minimumSearchTextLength;

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    setFocus: () => inputRef.current?.focus(),
    clearSearchText: () => handleClear(),
  }));

  // Sync controlled value
  useEffect(() => {
    if (isControlled) {
      setInternalText(value ?? '');
    }
  }, [value, isControlled]);

  // Announce results via screen reader
  const announceResults = useCallback(() => {
    if (!searchText || searchText.length < minimumSearchTextLength) {
      setAnnouncement('');
      return;
    }

    // Clear-then-set pattern for screen reader re-detection
    setAnnouncement('');

    announcementTimerRef.current = setTimeout(() => {
      const enabledOptions = options.filter(o => !o.disabled);
      const count = enabledOptions.length;

      // Don't announce if only disabled options exist (loading state)
      if (options.length > 0 && count === 0) return;

      let msg = '';
      if (count === 0) {
        msg = 'No Items Found';
      } else if (count === 1) {
        msg = '1 result found';
      } else {
        msg = `${count} results found`;
      }

      setAnnouncement(msg);
    }, 400);
  }, [searchText, minimumSearchTextLength, options]);

  // Re-announce whenever options change (mirrors optionsChanges.pipe(delay(100)).subscribe)
  const prevOptionsLenRef = useRef(options.length);
  useEffect(() => {
    if (options.length !== prevOptionsLenRef.current) {
      prevOptionsLenRef.current = options.length;
      if (isOpen) {
        const timer = setTimeout(() => announceResults(), 100);
        return () => clearTimeout(timer);
      }
    }
  }); // run every render so options changes are caught

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementTimerRef.current !== null) {
        clearTimeout(announcementTimerRef.current);
      }
    };
  }, []);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(0);
    onDropdownVisible?.(true);

    setTimeout(() => {
      panelRef.current?.setAttribute('tabindex', '0');
      if (searchText.length >= minimumSearchTextLength) {
        announceResults();
      }
    }, 0);
  }, [onDropdownVisible, searchText, minimumSearchTextLength, announceResults]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    onDropdownVisible?.(false);
  }, [onDropdownVisible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!isControlled) setInternalText(newVal);
    onChange?.(newVal);

    if (!newVal || newVal.length < minimumSearchTextLength) {
      if (announcementTimerRef.current !== null) {
        clearTimeout(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
      setAnnouncement('');
    } else {
      if (announcementTimerRef.current !== null) {
        clearTimeout(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
      announcementTimerRef.current = setTimeout(() => {
        announceResults();
      }, 500);
    }

    if (newVal.length >= minimumSearchTextLength) {
      openDropdown();
    } else {
      closeDropdown();
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalText('');
    onChange?.('');
    onClearedSearchText?.();
    setAnnouncement('');
    closeDropdown();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleOptionSelect = (option: AutocompleteOptionData) => {
    if (option.disabled) return;
    if (!isControlled) setInternalText(option.name);
    onChange?.(option.name);
    onOptionSelected?.({ value: option.name, id: option.id });
    closeDropdown();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && searchText.length >= minimumSearchTextLength) {
        openDropdown();
      }
      return;
    }

    const enabledIndices = options.reduce<number[]>((acc, opt, i) => {
      if (!opt.disabled) acc.push(i);
      return acc;
    }, []);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabledIndices.find(i => i > activeIndex) ?? enabledIndices[0] ?? -1;
        setActiveIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = [...enabledIndices].reverse().find(i => i < activeIndex) ?? enabledIndices[enabledIndices.length - 1] ?? -1;
        setActiveIndex(prev);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleOptionSelect(options[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        closeDropdown();
        inputRef.current?.focus();
        break;
      }
      case 'Tab': {
        closeDropdown();
        break;
      }
    }
  };

  // Close on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [closeDropdown]);

  return (
    <div className="sol-auto-complete body-md" ref={containerRef}>
      <div className="sol-text-input">
        <div className="sol-input-container">
          <input
            ref={inputRef}
            type="text"
            className="sol-input body-md"
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-controls={resolvedPanelId}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${resolvedPanelId}-option-${activeIndex}` : undefined}
            role="combobox"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchText.length >= minimumSearchTextLength) {
                openDropdown();
              }
            }}
          />
          {searchText && searchText.length > 0 && (
            <button
              type="button"
              className="sol-input-trailing-button"
              aria-label="clear icon"
              onClick={handleClear}
            >
              <svg width="16" height="16" fill-rule="evenodd" aria-hidden="true" viewBox="0 0 16 16">
                <path
                  d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z"
                  fillRule="evenodd"
                  fill="currentColor"
                />
                <path
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L8 6.94l1.47-1.47a.75.75 0 1 1 1.06 1.06L9.06 8l1.47 1.47a.75.75 0 1 1-1.06 1.06L8 9.06l-1.47 1.47a.75.75 0 0 1-1.06-1.06L6.94 8 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  fillRule="evenodd"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          id={resolvedPanelId}
          ref={panelRef}
          role="listbox"
          aria-label={ariaLabel}
          className="sol-autocomplete-panel"
        >
          {hasOptions && options.map((option, index) => (
            <div
              key={option.id}
              id={`${resolvedPanelId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              aria-disabled={option.disabled}
              className={[
                'sol-autocomplete-option',
                option.disabled ? 'sol-autocomplete-option--disabled' : '',
                activeIndex === index ? 'sol-autocomplete-option--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onMouseDown={e => {
                e.preventDefault(); // prevent input blur
                handleOptionSelect(option);
              }}
            >
              {option.content ?? option.name}
            </div>
          ))}

          {showNoItemsFound && (
            <div
              className="sol-autocomplete-option item-not-found body-md"
              role="option"
              aria-disabled="true"
              aria-selected={false}
            >
              No Items Found
            </div>
          )}
        </div>
      )}

      {/* ARIA live region for screen reader announcements */}
      <div
        className="sol-screenreader-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
    </div>
  );
});
