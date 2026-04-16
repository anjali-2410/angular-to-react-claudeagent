import React, { useEffect, useRef, useState } from 'react';
import './Chip.css';

let chipCounter = 0;

export type ChipSize = 'small' | 'medium' | 'large';
export type ChipVariant = 'primary' | 'basic';

export interface ChipProps {
  /** HTML id — auto-generated if omitted */
  id?: string;
  /** Shows a close (×) button */
  allowClose?: boolean;
  /** Enables double-click to edit the label */
  labelEditable?: boolean;
  /** Enables double-click to edit the subLabel */
  subLabelEditable?: boolean;
  /** tabindex on the chip root */
  chipTabIndex?: string;
  /** role on the chip root */
  chipRole?: string;
  /** Applies error styling */
  errorState?: boolean;
  /** Visual variant */
  variant?: ChipVariant;
  /** Size */
  size?: ChipSize;
  /** Main label text */
  label?: string;
  /** Sub-label text */
  subLabel?: string;
  /** Leading icon — any ReactNode (SVG, img, etc.) */
  icon?: React.ReactNode;
  /** Accessible label for the close button */
  closeIconAriaLabel?: string;
  /** Emitted when the close button is clicked */
  onClosed?: () => void;
  /** Emitted when the chip is clicked */
  onChipClicked?: (event: React.MouseEvent) => void;
  /** Emitted on keydown from the close button */
  onCloseButtonKeydown?: (event: React.KeyboardEvent) => void;
  /** Emitted on keydown from the chip */
  onChipKeydown?: (event: React.KeyboardEvent) => void;
  /** Emitted when the label is committed after editing */
  onLabelChanged?: (label: string) => void;
  /** Emitted when the subLabel is committed after editing */
  onSubLabelChanged?: (subLabel: string) => void;
}

export const Chip: React.FC<ChipProps> = ({
  id,
  allowClose = false,
  labelEditable = false,
  subLabelEditable = false,
  chipTabIndex = '0',
  chipRole = 'none',
  errorState = false,
  variant = 'basic',
  size = 'medium',
  label = '',
  subLabel = '',
  icon = null,
  closeIconAriaLabel = 'Remove',
  onClosed,
  onChipClicked,
  onCloseButtonKeydown,
  onChipKeydown,
  onLabelChanged,
  onSubLabelChanged,
}) => {
  const uniqueId = useRef(`sol-chip-${++chipCounter}`).current;
  const resolvedId = id || uniqueId;

  const chipRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLButtonElement>(null);
  const labelEditRef = useRef<HTMLSpanElement>(null);
  const subLabelEditRef = useRef<HTMLSpanElement>(null);

  const [labelEditMode, setLabelEditMode] = useState(false);
  const [subLabelEditMode, setSubLabelEditMode] = useState(false);
  const [closeIconAriaHidden, setCloseIconAriaHidden] = useState(true);
  const [currentLabel, setCurrentLabel] = useState(label);
  const [currentSubLabel, setCurrentSubLabel] = useState(subLabel);

  // Sync label/subLabel from props
  useEffect(() => { setCurrentLabel(label); }, [label]);
  useEffect(() => { setCurrentSubLabel(subLabel); }, [subLabel]);

  // Place caret when entering label edit mode
  useEffect(() => {
    if (labelEditMode && labelEditRef.current) {
      const el = labelEditRef.current;
      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [labelEditMode]);

  // Place caret when entering subLabel edit mode
  useEffect(() => {
    if (subLabelEditMode && subLabelEditRef.current) {
      const el = subLabelEditRef.current;
      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [subLabelEditMode]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChipKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === 'Enter') {
      if (labelEditable) {
        setLabelEditMode(true);
        e.preventDefault();
      } else if (subLabelEditable) {
        setSubLabelEditMode(true);
        e.preventDefault();
      }
    } else if (e.code === 'ArrowRight' && allowClose) {
      closeIconRef.current?.focus();
    }
    onChipKeydown?.(e);
  };

  const handleChipClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onChipClicked?.(e);
  };

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onClosed?.();
  };

  const handleCloseButtonKeydown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.code === 'ArrowLeft') chipRef.current?.focus();
    onCloseButtonKeydown?.(e);
  };

  const handleCloseKeydown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.code === 'Enter' || e.code === 'Space') handleClose(e);
    handleCloseButtonKeydown(e);
  };

  const handleLabelKeydown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.code === 'Enter') {
      e.preventDefault();
      if (subLabelEditable) {
        setLabelEditMode(false);
        setSubLabelEditMode(true);
      } else {
        setLabelEditMode(false);
        chipRef.current?.focus();
      }
    }
  };

  const handleSubLabelKeydown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.code === 'Enter') {
      e.preventDefault();
      setSubLabelEditMode(false);
      chipRef.current?.focus();
    }
  };

  const handleLabelBlur = () => {
    if (labelEditMode) {
      setLabelEditMode(false);
      const newLabel = labelEditRef.current?.textContent?.trim() ?? currentLabel;
      if (newLabel !== currentLabel) {
        setCurrentLabel(newLabel);
        onLabelChanged?.(newLabel);
      }
    }
  };

  const handleSubLabelBlur = () => {
    if (subLabelEditMode) {
      setSubLabelEditMode(false);
      const newSubLabel = subLabelEditRef.current?.textContent?.trim() ?? currentSubLabel;
      if (newSubLabel !== currentSubLabel) {
        setCurrentSubLabel(newSubLabel);
        onSubLabelChanged?.(newSubLabel); // note: Angular source had a bug — emitted label, we emit subLabel
      }
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const innerClassName = [variant, size, errorState ? 'error' : ''].filter(Boolean).join(' ');

  return (
    <div
      ref={chipRef}
      id={resolvedId}
      className={`sol-chip ${variant} ${size}`}
      tabIndex={parseInt(chipTabIndex, 10)}
      role={chipRole}
      onKeyDown={handleChipKeydown}
      onClick={handleChipClick}
    >
      <div className={innerClassName}>
        {icon && <span className="icon">{icon}</span>}

        {(currentLabel || labelEditable) && (
          <span
            className="main-label chip-text-content"
            title={currentLabel}
          >
            {labelEditable ? (
              <span
                ref={labelEditRef}
                tabIndex={-1}
                className="label-edit-mode chip-text-editable"
                contentEditable={labelEditMode}
                suppressContentEditableWarning
                onDoubleClick={() => setLabelEditMode(true)}
                onKeyDown={handleLabelKeydown}
                onBlur={handleLabelBlur}
              >
                {currentLabel}
              </span>
            ) : (
              currentLabel
            )}
          </span>
        )}

        {(currentSubLabel || subLabelEditable) && (
          <span
            className="sub-label chip-text-content"
            title={currentSubLabel}
          >
            {subLabelEditable ? (
              <span
                ref={subLabelEditRef}
                tabIndex={-1}
                className="sub-label-edit-mode chip-text-editable"
                contentEditable={subLabelEditMode}
                suppressContentEditableWarning
                onDoubleClick={() => setSubLabelEditMode(true)}
                onKeyDown={handleSubLabelKeydown}
                onBlur={handleSubLabelBlur}
              >
                {currentSubLabel}
              </span>
            ) : (
              currentSubLabel
            )}
          </span>
        )}

        {allowClose && (
          <button
            ref={closeIconRef}
            type="button"
            className="close-icon"
            tabIndex={-1}
            aria-label={closeIconAriaLabel}
            aria-hidden={closeIconAriaHidden}
            onFocus={() => setCloseIconAriaHidden(false)}
            onBlur={() => setCloseIconAriaHidden(true)}
            onClick={handleClose}
            onKeyDown={handleCloseKeydown}
          >
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.0402 4.04022C4.35262 3.7278 4.85915 3.7278 5.17157 4.04022L7.99999 6.86864L10.8284 4.04021C11.1408 3.72779 11.6474 3.72779 11.9598 4.04021C12.2722 4.35263 12.2722 4.85916 11.9598 5.17158L9.13136 8.00001L11.9598 10.8284C12.2722 11.1409 12.2722 11.6474 11.9598 11.9598C11.6474 12.2722 11.1408 12.2722 10.8284 11.9598L7.99999 9.13138L5.17158 11.9598C4.85916 12.2722 4.35262 12.2722 4.0402 11.9598C3.72779 11.6474 3.72779 11.1409 4.0402 10.8284L6.86862 8.00001L4.0402 5.17159C3.72778 4.85917 3.72778 4.35264 4.0402 4.04022Z"
                fill="none"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
