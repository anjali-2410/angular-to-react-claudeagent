import React, { useMemo, useRef, useEffect } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './Label.css';

export interface LabelProps {
  label?: string;
  labelHelpText?: string;
  labelFor?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  label = '',
  labelHelpText = '',
  labelFor = '',
  required = false,
  disabled = false,
  readonly = false,
}) => {
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const helpButtonRef = useRef<HTMLSpanElement>(null);

  const isVisible = label !== '';

  const isMandatoryDisplay = useMemo(() => {
    if (disabled) return false;
    if (readonly) return false;
    return required;
  }, [required, disabled, readonly]);

  const isHelpDisplay = useMemo(() => {
    if (disabled) return false;
    return labelHelpText !== '';
  }, [labelHelpText, disabled]);

  // Overflow-only tooltip on label text
  useEffect(() => {
    const el = labelTextRef.current;
    if (!el || !label) return;
    const instance = tippy(el, {
      content: label,
      onShow: (tip) => {
        if (el.scrollWidth <= el.clientWidth) {
          tip.disable();
          return false;
        }
        tip.enable();
      },
    });
    return () => instance.destroy();
  }, [label]);

  // Tooltip on help button
  useEffect(() => {
    const el = helpButtonRef.current;
    if (!el || !labelHelpText) return;
    const instance = tippy(el, { content: labelHelpText });
    return () => instance.destroy();
  }, [labelHelpText]);

  if (!isVisible) return null;

  const labelClass = [
    'sol-label',
    required ? 'required' : '',
    disabled ? 'disabled' : '',
    readonly ? 'readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label
      className={labelClass}
      htmlFor={labelFor || undefined}
      aria-disabled={disabled ? 'true' : undefined}
    >
      <span className="sol-label-content">
        <span id="sol-label-text" className="sol-label-text" ref={labelTextRef}>
          {label}
        </span>

        {isMandatoryDisplay && (
          <span className="sol-label-asterisk">
            <span aria-hidden="true">*</span>
            <span className="sol-screenreader-only">Required</span>
          </span>
        )}

        {isHelpDisplay && (
          <span className="sol-label-help">
            <span
              className="sol-label-help-button"
              tabIndex={0}
              role="button"
              aria-label={labelHelpText}
              ref={helpButtonRef}
            >
              <svg
                className="sol-label-help-icon"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
              </svg>
              <span className="sol-screenreader-only">{labelHelpText}</span>
            </span>
          </span>
        )}
      </span>
    </label>
  );
};
