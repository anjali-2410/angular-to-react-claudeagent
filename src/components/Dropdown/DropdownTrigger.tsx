'use client';

import React from 'react';

export interface DropdownTriggerProps {
  placeholder?: string;
  displayText?: string;
  placeHolderIcon?: string | null;
  isOpen?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errorState?: boolean;
  isMultiSelect?: boolean;
  ariaLabel?: string;
  ariaLabelledById?: string;
  ariaControlsId?: string;
  ariaDescriptionId?: string | null;
  tooltipPlacement?: string;
  selectedOptionTemplate?: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  placeholder = '',
  displayText = '',
  placeHolderIcon = null,
  isOpen = false,
  disabled = false,
  readOnly = false,
  errorState = false,
  isMultiSelect = false,
  ariaLabel,
  ariaControlsId,
  ariaDescriptionId,
  tooltipPlacement = 'auto',
  selectedOptionTemplate,
  onClick,
  onKeyDown,
  onBlur,
}) => {
  const computedAriaLabel = ariaLabel
    ? isOpen
      ? ariaLabel
      : `${ariaLabel}, Collapsed`
    : isOpen
    ? 'Toggle list'
    : 'Toggle list, Collapsed';

  return (
    <>
      <div
        className={[
          'sol-dropdown-trigger',
          'sol-input',
          disabled ? 'disabled' : '',
          errorState ? 'error' : '',
          isOpen ? 'open' : '',
          readOnly ? 'readonly' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="combobox"
        aria-label={computedAriaLabel}
        aria-expanded={isOpen}
        aria-controls={ariaControlsId}
        aria-haspopup="listbox"
        aria-describedby={ariaDescriptionId ?? undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      >
        <div className="sol-dropdown-inside sol-input body-md">
          {placeHolderIcon && (
            <div className="sol-option-icon">
              <span className={`sol-icon ${placeHolderIcon}`} />
            </div>
          )}
          {selectedOptionTemplate ? (
            <div className="placeholder-template sol-dropdown-content">
              {selectedOptionTemplate}
            </div>
          ) : displayText ? (
            <div
              className="sol-dropdown-content display-text"
              title={displayText}
              aria-live={isMultiSelect ? 'polite' : undefined}
              aria-atomic={isMultiSelect ? 'true' : undefined}
            >
              {displayText}
            </div>
          ) : (
            <div className="sol-dropdown-content placeholder-text" title={placeholder}>
              {placeholder}
            </div>
          )}
        </div>

        {!disabled && (!readOnly || (readOnly && isMultiSelect)) && (
          <div
            className={`sol-dropdown-icon sol-input-trailing-button-container${isOpen ? ' open' : ''}`}
          >
            <span className={`sol-icon ${isOpen ? 'sol-chevron-up' : 'sol-chevron-down'}`} />
          </div>
        )}
      </div>

      {ariaDescriptionId && (
        <span id={ariaDescriptionId} className="sol-screenreader-only">
          Use arrow keys to navigate options
        </span>
      )}
    </>
  );
};

DropdownTrigger.displayName = 'DropdownTrigger';
