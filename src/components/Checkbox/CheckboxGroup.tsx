import React, { useState } from 'react';
import { CheckboxGroupContext } from './Checkbox';

export interface CheckboxGroupProps {
  /** name for the group */
  name?: string;
  /** Disables all checkboxes in the group */
  disabled?: boolean;
  /** Makes all checkboxes in the group read-only */
  readonly?: boolean;
  /** Marks the group as required — shows error on blur if no option is selected */
  required?: boolean;
  /** Array of selected values (controlled); omit for uncontrolled mode */
  value?: string[];
  /** Text label rendered above the group */
  label?: string;
  /** Shows error border on the group */
  errorState?: boolean;
  /** External error message text */
  errorMessage?: string;
  /** Emitted with the new array of selected values when any checkbox changes */
  onClicked?: (values: string[]) => void;
  /** Checkbox children */
  children?: React.ReactNode;
}

const FIELD_REQUIRED_MSG = 'This field is required.';

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  name,
  disabled = false,
  readonly = false,
  required = false,
  value: valueProp,
  label,
  errorState = false,
  errorMessage,
  onClicked,
  children,
}) => {
  const isControlled = valueProp !== undefined;
  const [internalValues, setInternalValues] = useState<string[]>(valueProp ?? []);
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>();

  const selectedValues = isControlled ? valueProp! : internalValues;

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const next = checked
      ? selectedValues.includes(value)
        ? selectedValues
        : [...selectedValues, value]
      : selectedValues.filter(v => v !== value);

    if (!isControlled) {
      setInternalValues(next);
    }

    if (required && next.length > 0) {
      setInternalError(undefined);
    }

    onClicked?.(next);
  };

  const handleFocusOut = () => {
    if (!touched) {
      setTouched(true);
    }
    if (required && selectedValues.length === 0) {
      setInternalError(FIELD_REQUIRED_MSG);
    } else {
      setInternalError(undefined);
    }
  };

  const errorText = errorMessage || internalError;
  const hasError = !!(errorText || errorState);
  const errorId = hasError ? `sol-cbg-error-${name ?? 'group'}` : undefined;

  return (
    <CheckboxGroupContext.Provider
      value={{
        selectedValues,
        disabled,
        readonly,
        onCheckboxChange: handleCheckboxChange,
      }}
    >
      <div
        role="group"
        className="sol-checkbox-group"
        aria-describedby={errorId}
        onBlur={handleFocusOut}
      >
        {label && (
          <div className="sol-checkbox-group-label">
            <span className="sol-label">
              {label}
              {required && <span className="sol-label-required"> *</span>}
            </span>
          </div>
        )}
        <div className="checkbox-group-options">{children}</div>
        {errorText && (
          <div id={errorId} className="sol-checkbox-error-message">
            {errorText}
          </div>
        )}
      </div>
    </CheckboxGroupContext.Provider>
  );
};
