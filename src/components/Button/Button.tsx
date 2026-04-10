import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'critical';
export type ButtonSize = 'large' | 'medium' | 'small';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  critical: 'btn-critical',
};

export interface ButtonProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** HTML id attribute */
  id?: string;
  /** HTML name attribute */
  name?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** HTML value attribute */
  value?: string;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Icon element rendered after the label */
  iconEnd?: React.ReactNode;
  /** Accessible label — only set when it adds information beyond visible text */
  ariaLabel?: string;
  /** ID of the element that labels this button */
  ariaLabelledBy?: string;
  /** ID of the element that describes this button */
  ariaDescribedBy?: string;
  /** Indicates the pressed state (toggle buttons) */
  ariaPressed?: boolean;
  /** Indicates expanded state (menus / disclosures) */
  ariaExpanded?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Visual-only disabled state (still focusable) */
  disabledAltState?: boolean;
  /** Explicit tabIndex */
  tabIndex?: number;
  /** Button content */
  children?: React.ReactNode;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ButtonHandle {
  focus: () => void;
}

export const Button = forwardRef<ButtonHandle, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'large',
    id,
    name,
    type = 'button',
    value,
    icon,
    iconEnd,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaPressed,
    ariaExpanded,
    disabled = false,
    disabledAltState = false,
    tabIndex,
    children,
    onFocus,
    onBlur,
    onClick,
  },
  ref
) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
  }));

  const buttonClass = useMemo(
    () => `sol-button ${VARIANT_CLASS[variant]}-${size}`,
    [variant, size]
  );

  const hasChildren = children != null && children !== '' && children !== false;

  return (
    <button
      ref={buttonRef}
      id={id}
      className={`${buttonClass}${disabledAltState ? ' disabled-alt-state' : ''}`}
      disabled={disabled}
      tabIndex={tabIndex}
      aria-label={ariaLabel || undefined}
      aria-labelledby={ariaLabelledBy || undefined}
      aria-describedby={ariaDescribedBy || undefined}
      aria-disabled={disabled || disabledAltState ? 'true' : undefined}
      aria-pressed={ariaPressed ?? undefined}
      aria-expanded={ariaExpanded ?? undefined}
      name={name || undefined}
      type={type}
      value={value || undefined}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
    >
      {icon && (
        <span className="sol-button-icon sol-icon-pointer-events-none">{icon}</span>
      )}
      {hasChildren && <span className="projected-content">{children}</span>}
      {iconEnd && <span className="sol-button-icon">{iconEnd}</span>}
    </button>
  );
});
