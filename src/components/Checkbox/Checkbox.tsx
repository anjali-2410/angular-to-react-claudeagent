import React, { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Checkbox.css';

let checkboxCounter = 0;

export interface CheckboxChangeEvent {
  checked: boolean;
  indeterminate: boolean;
}

export interface CheckboxGroupContextValue {
  selectedValues: string[];
  disabled: boolean;
  readonly: boolean;
  onCheckboxChange: (value: string, checked: boolean) => void;
}

export const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxProps {
  /** The id attribute for the input element; auto-generated if omitted */
  checkboxId?: string;
  /** Disables the checkbox */
  disabled?: boolean;
  /** Makes the checkbox read-only (non-interactive but not disabled) */
  readonly?: boolean;
  /** name attribute for the input */
  name?: string;
  /** Marks the checkbox as required */
  required?: boolean;
  /** value attribute for the input */
  value?: string;
  /** aria-label attribute */
  ariaLabel?: string;
  /** aria-labelledby attribute */
  ariaLabelledby?: string | null;
  /** aria-describedby attribute */
  ariaDescribedby?: string | null;
  /** tabindex for the input */
  tabIndex?: number;
  /** Custom label content (replaces Angular's customTemplate) */
  customContent?: React.ReactNode;
  /** Shows error border styling */
  errorState?: boolean;
  /** Error message text displayed below the checkbox */
  errorMessage?: string;
  /** Text label rendered beside the checkbox */
  label?: string;
  /** Indeterminate (mixed) state */
  indeterminate?: boolean;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Emitted on any click, including readonly */
  onClicked?: () => void;
  /** Emitted when checked state changes */
  onCheckedChange?: (event: CheckboxChangeEvent) => void;
  /** Emitted when indeterminate state changes */
  onIndeterminateChange?: (event: CheckboxChangeEvent) => void;
  /** Emitted on blur */
  onBlur?: (event: CheckboxChangeEvent) => void;
  /** Emitted on focus */
  onFocus?: (event: CheckboxChangeEvent) => void;
  /** Label content via children (used when label prop is absent) */
  children?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checkboxId,
    disabled = false,
    readonly = false,
    name = '',
    required = false,
    value = '',
    ariaLabel,
    ariaLabelledby = null,
    ariaDescribedby = null,
    tabIndex = 0,
    customContent,
    errorState = false,
    errorMessage,
    label,
    indeterminate = false,
    checked: checkedProp,
    onClicked,
    onCheckedChange,
    onIndeterminateChange,
    onBlur,
    onFocus,
    children,
  },
  forwardedRef
) {
  const uniqueIdRef = useRef<number>(++checkboxCounter);
  const resolvedId = checkboxId || `sol-checkbox-${uniqueIdRef.current}`;

  const group = useContext(CheckboxGroupContext);
  const isDisabled = disabled || (group?.disabled ?? false);
  const isReadonly = readonly || (group?.readonly ?? false);

  // Checked state — group overrides prop, prop overrides internal
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = useState<boolean>(checkedProp ?? false);

  const effectiveChecked = useMemo(() => {
    if (group) return group.selectedValues.includes(value);
    if (isControlled) return checkedProp!;
    return internalChecked;
  }, [group, value, isControlled, checkedProp, internalChecked]);

  // Indeterminate — track locally so click resets it while prop can override
  const [localIndeterminate, setLocalIndeterminate] = useState<boolean>(indeterminate);
  const internalRef = useRef<HTMLInputElement>(null);

  // Combine forwarded ref with internal ref
  const setRef = (el: HTMLInputElement | null) => {
    (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    }
  };

  // Sync indeterminate DOM property (React has no prop for this)
  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = localIndeterminate;
    }
  }, [localIndeterminate]);

  // Sync indeterminate from prop
  useEffect(() => {
    setLocalIndeterminate(indeterminate);
  }, [indeterminate]);

  // Sync checked from controlled prop
  useEffect(() => {
    if (isControlled) {
      setInternalChecked(checkedProp!);
    }
  }, [checkedProp, isControlled]);

  const hasError = !!(errorMessage || errorState);

  const buildChangeEvent = (checked: boolean, indet: boolean): CheckboxChangeEvent => ({
    checked,
    indeterminate: indet,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isReadonly) {
      e.preventDefault();
      onClicked?.();
      return;
    }
    e.stopPropagation();
    if (!isDisabled) {
      const newChecked = !effectiveChecked;

      // Reset indeterminate on user click
      if (localIndeterminate) {
        setLocalIndeterminate(false);
        onIndeterminateChange?.(buildChangeEvent(newChecked, false));
      }

      if (!isControlled && !group) {
        setInternalChecked(newChecked);
      }
      if (group) {
        group.onCheckboxChange(value, newChecked);
      }
      onCheckedChange?.(buildChangeEvent(newChecked, false));
    }
    onClicked?.();
  };

  const handleLabelAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target !== internalRef.current && !target.closest('label')) {
      internalRef.current?.click();
    }
  };

  const preventLabelDefault = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (isReadonly && !isDisabled) {
      e.preventDefault();
      onClicked?.();
    }
  };

  const handleFocus = () => {
    if (!isReadonly) {
      onFocus?.(buildChangeEvent(effectiveChecked, localIndeterminate));
    }
  };

  const handleBlur = () => {
    if (!isReadonly) {
      onBlur?.(buildChangeEvent(effectiveChecked, localIndeterminate));
    }
  };

  const showLabel = !!(customContent || label || children);
  const inputTabIndex = isReadonly && !isDisabled ? -1 : tabIndex;
  const ariaHiddenVal = isReadonly && !isDisabled ? 'true' : undefined;

  const inputClassName = [
    'sol-checkbox-inputbox',
    isReadonly && !isDisabled ? 'readonly' : '',
    hasError ? 'error-border' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sol-checkbox" style={{ display: 'flex' }}>
      <div className="sol-checkbox-label clickable" onClick={handleLabelAreaClick}>
        <input
          ref={setRef}
          className={inputClassName}
          type="checkbox"
          id={resolvedId}
          value={value || undefined}
          name={name || undefined}
          required={required}
          checked={effectiveChecked}
          disabled={isDisabled}
          tabIndex={inputTabIndex}
          aria-hidden={ariaHiddenVal}
          aria-label={ariaLabel || undefined}
          aria-labelledby={ariaLabelledby || undefined}
          aria-describedby={ariaDescribedby || undefined}
          aria-checked={localIndeterminate ? 'mixed' : effectiveChecked}
          aria-disabled={isDisabled}
          aria-required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showLabel && (
          <div className="sol-checkbox-label-text">
            <label htmlFor={resolvedId} onClick={preventLabelDefault}>
              {customContent ??
                (label ? (
                  <>
                    {label}
                    {required && <span className="sol-label-required"> *</span>}
                  </>
                ) : (
                  children
                ))}
            </label>
          </div>
        )}
      </div>
      {!group && errorMessage && (
        <div className="sol-checkbox-error-message">{errorMessage}</div>
      )}
    </div>
  );
});
