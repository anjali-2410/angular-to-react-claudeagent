'use client';

import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  size as floatingSize,
} from '@floating-ui/react';
import { DropdownTrigger } from './DropdownTrigger';
import './Dropdown.css';

export type SortOrder = 'asc' | 'desc';

export interface ExternalSearchOptions {
  enabled: boolean;
  keyStrokeDelay: number;
  resultsCount: number;
}

export interface DropdownOption {
  [key: string]: any;
}

export interface DropdownProps {
  id?: string;
  name?: string;
  options?: DropdownOption[];
  value?: DropdownOption | DropdownOption[] | null;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  searchEnabled?: boolean;
  showFooter?: boolean;
  loading?: boolean;
  sortEnabled?: boolean;
  sortKey?: string;
  sortOrder?: SortOrder;
  maxItemsLimit?: number;
  maxSelectionLimit?: number;
  optionsLabel?: string;
  optionsValue?: string;
  optionsIcon?: string;
  externalSearchOptions?: ExternalSearchOptions;
  tooltipPlacement?: string;
  optionTemplate?: (option: DropdownOption) => React.ReactNode;
  selectedOptionTemplate?: (option: DropdownOption | DropdownOption[]) => React.ReactNode;
  externalSearchError?: boolean;
  onSelectionChange?: (value: DropdownOption | DropdownOption[] | null) => void;
  onOpenStateChange?: (isOpen: boolean) => void;
  onSearchChanged?: (query: string) => void;
  onExternalSearch?: (payload: any) => void;
  onSelectAllToggled?: (allSelected: boolean) => void;
  onChange?: (value: DropdownOption | DropdownOption[] | null) => void;
  onBlur?: () => void;
}

export interface DropdownHandle {
  open: () => void;
  close: () => void;
  focus: () => void;
}

let dropdownCount = 0;

export const Dropdown = forwardRef<DropdownHandle, DropdownProps>(
  (
    {
      id,
      name,
      options = [],
      value,
      placeholder = '',
      multiple = false,
      disabled = false,
      readOnly = false,
      required = false,
      searchEnabled = false,
      showFooter = false,
      loading = false,
      sortEnabled = true,
      sortKey = 'name',
      sortOrder = 'asc',
      maxItemsLimit = 2500,
      maxSelectionLimit = 1,
      optionsLabel = 'name',
      optionsValue = 'value',
      optionsIcon = 'icon',
      externalSearchOptions = { enabled: false, keyStrokeDelay: 500, resultsCount: 0 },
      tooltipPlacement = 'auto',
      optionTemplate,
      selectedOptionTemplate,
      externalSearchError = false,
      onSelectionChange,
      onOpenStateChange,
      onSearchChanged,
      onExternalSearch,
      onSelectAllToggled,
      onChange,
      onBlur,
    },
    ref
  ) => {
    useId(); // satisfies React's rules of hooks ordering
    const [defaultId] = useState(() => {
      dropdownCount++;
      return `sol-dropdown-${dropdownCount}`;
    });

    const resolvedId = id || defaultId;
    const selectOptionsId = `${resolvedId}-select-options`;
    const ariaDescriptionId = `${resolvedId}-description`;

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [touched, setTouched] = useState(false);
    const [liveAnnouncement, setLiveAnnouncement] = useState('');

    const triggerRef = useRef<HTMLDivElement>(null);

    const { refs, floatingStyles } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      middleware: [
        offset(4),
        flip(),
        floatingSize({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

    useImperativeHandle(ref, () => ({
      open: () => openDropdown(),
      close: () => closeDropdown(),
      focus: () => triggerRef.current?.querySelector<HTMLElement>('.sol-dropdown-trigger')?.focus(),
    }));

    const processedOptions = React.useMemo(() => {
      let opts = Array.isArray(options) ? options : [];
      if (opts.length > maxItemsLimit) {
        opts = opts.slice(0, maxItemsLimit);
      }
      if (sortEnabled && opts.length > 0) {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        return ([...opts] as any[])
          .map((o: DropdownOption, i: number) => ({ ...o, _idx: i }))
          .sort((a: any, b: any) => {
            const key = sortKey || optionsLabel;
            const av = a[key];
            const bv = b[key];
            let cmp = 0;
            if (typeof av === 'number' && typeof bv === 'number') {
              cmp = av - bv;
            } else {
              cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, {
                numeric: true,
                sensitivity: 'base',
                caseFirst: 'lower',
              });
            }
            return cmp !== 0 ? cmp * multiplier : a._idx - b._idx;
          })
          .map(({ _idx, ...o }: any) => o as DropdownOption);
      }
      return opts;
    }, [options, maxItemsLimit, sortEnabled, sortOrder, sortKey, optionsLabel]);

    const getOptionLabel = (opt: DropdownOption) => opt?.[optionsLabel] ?? '';
    const getOptionValue = (opt: DropdownOption) => opt?.[optionsValue];
    const getOptionIcon = (opt: DropdownOption) => opt?.[optionsIcon] ?? null;

    const displayText = React.useMemo(() => {
      if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
          if (
            externalSearchOptions.enabled &&
            value.length === externalSearchOptions.resultsCount
          ) {
            return 'All items selected';
          }
          if (!externalSearchOptions.enabled && value.length === options.length) {
            return 'All items selected';
          }
          if (value.length > 1) return `${value.length} items selected`;
          return getOptionLabel(value[0]);
        }
        return '';
      }
      if (value && !Array.isArray(value) && getOptionValue(value) != null) {
        return getOptionLabel(value);
      }
      return '';
    }, [value, multiple, options.length, optionsLabel, optionsValue, externalSearchOptions]);

    const placeHolderIcon = React.useMemo(() => {
      if (!multiple && value && !Array.isArray(value)) return getOptionIcon(value);
      if (multiple && Array.isArray(value) && value.length === 1) return getOptionIcon(value[0]);
      return null;
    }, [value, multiple, optionsIcon]);

    const selectionIds = React.useMemo(() => {
      if (Array.isArray(value)) return value.map((v) => getOptionValue(v));
      if (value) return getOptionValue(value);
      return [];
    }, [value, optionsValue]);

    const isValid = () => {
      if (!required) return true;
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    };

    const errorState = touched && !isValid();

    function openDropdown() {
      if (disabled || (readOnly && !multiple)) return;
      setIsOpen(true);
      onOpenStateChange?.(true);
      if (externalSearchOptions.enabled) {
        onExternalSearch?.({ searchQuery: '', selectedItem: selectionIds });
      }
    }

    function closeDropdown() {
      setIsOpen(false);
      onOpenStateChange?.(false);
      markTouched();
      setTimeout(() => {
        triggerRef.current?.querySelector<HTMLElement>('.sol-dropdown-trigger')?.focus();
      }, 0);
    }

    function markTouched() {
      if (!touched) {
        setTouched(true);
        onBlur?.();
      }
    }

    function handleSelectionChange(selected: any) {
      let next: DropdownOption | DropdownOption[] | null;
      if (Array.isArray(selected)) {
        let opts = selected
          .map((v: any) => processedOptions.find((o) => o[optionsValue] === v))
          .filter(Boolean) as DropdownOption[];
        if (multiple && maxSelectionLimit > 1 && opts.length > maxSelectionLimit) {
          opts = opts.slice(0, maxSelectionLimit);
        }
        next = opts;
        if (
          Array.isArray(value) &&
          (value as DropdownOption[]).length > 0 &&
          opts.length === 0
        ) {
          setLiveAnnouncement('All items deselected');
        }
      } else {
        next = processedOptions.find((o) => o[optionsValue] === selected) ?? null;
        closeDropdown();
      }
      onSelectionChange?.(next);
      onChange?.(next);
    }

    function handleSearch(q: string) {
      setSearchQuery(q);
      onSearchChanged?.(q);
    }

    function handleSelectAll(all: boolean) {
      onSelectAllToggled?.(all);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Tab') { markTouched(); return; }
      if (!isOpen && !disabled && (!readOnly || multiple)) {
        if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openDropdown();
        }
      }
    }

    useEffect(() => {
      if (!isOpen) return;
      function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') closeDropdown();
      }
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      function handleOutside(e: MouseEvent) {
        const floating = refs.floating.current;
        const reference = refs.domReference.current as HTMLElement | null;
        if (
          floating &&
          !floating.contains(e.target as Node) &&
          reference &&
          !reference.contains(e.target as Node)
        ) {
          closeDropdown();
        }
      }
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    return (
      <div
        className="sol-dropdown"
        id={id ? `${id}-container` : defaultId}
        data-name={name}
        ref={refs.setReference as React.RefCallback<HTMLDivElement>}
      >
        <div ref={triggerRef}>
          <DropdownTrigger
            ariaLabel={placeholder || undefined}
            ariaControlsId={selectOptionsId}
            ariaDescriptionId={ariaDescriptionId}
            placeHolderIcon={placeHolderIcon}
            placeholder={placeholder}
            displayText={displayText}
            isOpen={isOpen}
            disabled={disabled}
            readOnly={readOnly}
            tooltipPlacement={tooltipPlacement}
            errorState={errorState}
            isMultiSelect={multiple}
            selectedOptionTemplate={
              selectedOptionTemplate && value ? selectedOptionTemplate(value) : undefined
            }
            onClick={() => {
              if (isOpen) closeDropdown();
              else openDropdown();
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (touched) onBlur?.();
              markTouched();
            }}
          />
        </div>

        <div
          className="sol-screenreader-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveAnnouncement}
        </div>

        {!isOpen && (
          <div id={selectOptionsId} aria-hidden="true" />
        )}

        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 1000 }}
            className="sol-dropdown-options-panel"
            id={selectOptionsId}
          >
            <div className="sol-select-cls">
              {loading ? (
                <div className="sol-dropdown-loading">Loading…</div>
              ) : (
                <ul role="listbox" aria-multiselectable={multiple}>
                  {searchEnabled && (
                    <li className="sol-dropdown-search-item">
                      <input
                        className="sol-input sol-dropdown-search"
                        type="text"
                        value={searchQuery}
                        placeholder="Search…"
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                      />
                    </li>
                  )}
                  {processedOptions
                    .filter((opt) => {
                      if (!searchQuery) return true;
                      return getOptionLabel(opt)
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    })
                    .map((opt, i) => {
                      const val = getOptionValue(opt);
                      const selected = Array.isArray(selectionIds)
                        ? selectionIds.includes(val)
                        : selectionIds === val;
                      return (
                        <li
                          key={val ?? i}
                          id={`sol-option-${val}`}
                          className={`sol-option${selected ? ' option-selected' : ''}`}
                          role="option"
                          aria-selected={selected}
                          data-index={i}
                          onClick={() =>
                            handleSelectionChange(
                              multiple
                                ? selected
                                  ? (Array.isArray(selectionIds)
                                      ? selectionIds.filter((s) => s !== val)
                                      : [])
                                  : [...(Array.isArray(selectionIds) ? selectionIds : []), val]
                                : val
                            )
                          }
                        >
                          {optionTemplate ? (
                            optionTemplate(opt)
                          ) : (
                            <span className="sol-option-text">{getOptionLabel(opt)}</span>
                          )}
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        )}

        {ariaDescriptionId && (
          <span id={ariaDescriptionId} className="sol-screenreader-only">
            Use arrow keys to navigate options
          </span>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
