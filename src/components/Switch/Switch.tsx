'use client';

import React, { useId, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import './Switch.css';

export type SwitchSize = 'small' | 'large';

export interface SwitchChangeEvent {
  checked: boolean;
}

export interface SwitchProps {
  toggleId?: string;
  name?: string;
  label?: string;
  required?: boolean;
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  symbol?: boolean;
  size?: SwitchSize;
  ariaLabel?: string | null;
  ariaLabelledby?: string;
  ariaDescribedby?: string | null;
  interactionHint?: string;
  onCheckedChange?: (event: SwitchChangeEvent) => void;
  onBlur?: () => void;
}

export const Switch: React.FC<SwitchProps> = ({
  toggleId,
  name,
  label,
  required = false,
  checked = false,
  disabled = false,
  readonly = false,
  symbol = false,
  size = 'large',
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  interactionHint = 'Press Space to toggle',
  onCheckedChange,
  onBlur,
}) => {
  const generatedId = useId().replace(/:/g, '');
  const currentId = toggleId || `sol-switch-${generatedId}`;
  const buttonId = `${currentId}-button`;
  const interactionHintId = `${currentId}-interaction-hint`;

  const isDisabled = disabled;
  const isInteractive = !isDisabled && !readonly;
  const showInteractionHint = isInteractive && !!interactionHint;

  const effectiveAriaLabel = ariaLabel ?? label ?? null;

  const combinedAriaDescribedBy = useMemo(() => {
    const ids: string[] = [];
    if (showInteractionHint) ids.push(interactionHintId);
    if (ariaDescribedby) ids.push(ariaDescribedby);
    return ids.join(' ') || undefined;
  }, [showInteractionHint, interactionHintId, ariaDescribedby]);

  const handleClick = useCallback(() => {
    if (!isInteractive) return;
    onCheckedChange?.({ checked: !checked });
  }, [isInteractive, checked, onCheckedChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isInteractive) return;
        onCheckedChange?.({ checked: !checked });
      }
    },
    [isInteractive, checked, onCheckedChange]
  );

  const switchClass = [
    'sol-switch',
    size,
    symbol ? 'icon' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const buttonClass = [
    'sol-switch-button',
    checked ? 'checked' : '',
    readonly ? 'sol-readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={switchClass} id={currentId}>
      {showInteractionHint && (
        <span id={interactionHintId} className="sol-screenreader-only">
          {interactionHint}
        </span>
      )}

      <div className="sol-switch-control">
        <button
          type="button"
          role="switch"
          id={buttonId}
          name={name}
          aria-checked={checked}
          aria-label={effectiveAriaLabel ?? undefined}
          aria-labelledby={ariaLabelledby}
          aria-describedby={combinedAriaDescribedBy}
          aria-required={required || undefined}
          disabled={isDisabled || readonly}
          className={buttonClass}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        >
          <span className="sol-switch-track">
            <span className="sol-switch-thumb" />
          </span>
        </button>

        {label && (
          <label className="sol-switch-label" htmlFor={buttonId}>
            {label}
          </label>
        )}
      </div>
    </div>
  );
};
