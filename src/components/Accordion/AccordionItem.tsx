import React, { useContext, useEffect, useRef, useState } from 'react';
import { AccordionGroupContext } from './Accordion';

let accordionItemCounter = 0;

export interface AccordionItemProps {
  /** Header text displayed in the panel trigger */
  header?: string;
  /** HTML id for the panel element */
  id?: string | null;
  /** Whether the panel is initially expanded */
  selected?: boolean;
  /** Whether to hide the toggle arrow icon */
  hideToggle?: boolean;
  /** Whether the panel is disabled */
  disabled?: boolean;
  /** Custom header content — replaces Angular's `customHeader: TemplateRef` */
  customHeader?: React.ReactNode;
  /** Emitted when the panel opens */
  onOpened?: () => void;
  /** Emitted when the panel closes */
  onClosed?: () => void;
  /** Emitted on every open/close toggle */
  onToggle?: () => void;
  /** Panel body content */
  children?: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  header = '',
  id,
  selected = false,
  hideToggle = false,
  disabled = false,
  customHeader,
  onOpened,
  onClosed,
  onToggle,
  children,
}) => {
  const uniqueId = useRef(`sol-accordion-item-${++accordionItemCounter}`).current;
  const itemId = id || uniqueId;
  const [isOpen, setIsOpen] = useState(selected);
  const ctx = useContext(AccordionGroupContext);

  // In single-open mode: close this panel when another panel opens
  useEffect(() => {
    if (ctx && !ctx.multiple && ctx.lastOpenedId && ctx.lastOpenedId !== itemId) {
      setIsOpen(false);
    }
  }, [ctx?.lastOpenedId, ctx?.multiple, itemId]);

  const handleClick = () => {
    if (disabled) return;
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen) {
      ctx?.notifyOpened(itemId);
      onOpened?.();
    } else {
      onClosed?.();
    }
    onToggle?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const panelClass = [
    'sol-accordion-panel',
    isOpen ? 'expanded' : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headerClass = [
    'sol-accordion-panel-header',
    isOpen ? 'expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass} id={itemId}>
      <div
        className={headerClass}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="sol-accordion-panel-header-content">
          <span className="sol-accordion-header-content">
            {customHeader ?? header}
          </span>
          {!hideToggle && (
            <svg
              className="sol-accordion-arrow-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M9.00497 13.7736L2.23881 7.35849C1.9204 7.0566 1.9204 6.5283 2.23881 6.22642C2.55721 5.92453 3.11443 5.92453 3.43284 6.22642L9.80099 12.2642L16.5672 6.22642C16.8856 5.92453 17.4428 5.92453 17.7612 6.22642C18.0796 6.5283 18.0796 7.0566 17.7612 7.35849L10.597 13.7736C10.3582 14 10.1194 14 9.8806 14C9.48259 14 9.16418 13.9245 9.00497 13.7736Z" />
            </svg>
          )}
        </div>
      </div>
      <div className="sol-accordion-panel-content">
        <div className="sol-accordion-panel-body">{children}</div>
      </div>
    </div>
  );
};
