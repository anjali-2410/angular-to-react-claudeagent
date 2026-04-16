import React from 'react';
import './Card.css';

// ── Slot sub-components ───────────────────────────────────────────────────────
// These mirror Angular's sol-card-body and sol-card-footer slot components.
// Card detects their presence via displayName to decide whether to render
// the body/footer wrappers (matching Angular's @ContentChild detection).

export interface CardBodyProps {
  children?: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({ children }) => <>{children}</>;
CardBody.displayName = 'CardBody';

export interface CardFooterProps {
  children?: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children }) => <>{children}</>;
CardFooter.displayName = 'CardFooter';

// ── Card ──────────────────────────────────────────────────────────────────────

export interface CardProps {
  /** Uses an alternative surface background colour */
  useAlternativeBackgroundColor?: boolean;
  /** Shows a divider line between body and footer when both are present */
  divider?: boolean;
  /** Adds a hover background style — only use when the whole card is interactive */
  enableHover?: boolean;
  /** aria-labelledby — prefer over aria-label so accessible name matches visible text */
  ariaLabelledby?: string | null;
  /** aria-describedby — reference additional context (summary / status / help text) */
  ariaDescribedby?: string | null;
  /** aria-live — use only for truly dynamic card content updates */
  ariaLive?: 'polite' | 'assertive' | 'off' | null;
  /** When true the card is selectable; aria-selected reflects `selected` */
  selectable?: boolean;
  /** Selection state when selectable is enabled */
  selected?: boolean;
  /** CardBody and/or CardFooter children */
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  useAlternativeBackgroundColor = false,
  divider = true,
  enableHover = false,
  ariaLabelledby = null,
  ariaDescribedby = null,
  ariaLive = null,
  selectable = false,
  selected = false,
  children,
}) => {
  // Detect CardBody / CardFooter slots — mirrors Angular's @ContentChild detection
  let bodyContent: React.ReactNode = null;
  let footerContent: React.ReactNode = null;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const displayName = (child.type as { displayName?: string }).displayName;
    if (displayName === 'CardBody') bodyContent = (child.props as CardBodyProps).children;
    else if (displayName === 'CardFooter') footerContent = (child.props as CardFooterProps).children;
  });

  const hasBody = bodyContent !== null;
  const hasFooter = footerContent !== null;
  const showDivider = hasBody && hasFooter && divider;

  const className = [
    'sol-card',
    showDivider ? 'show-divider' : '',
    useAlternativeBackgroundColor ? 'use-alternate-background-color' : '',
    enableHover ? 'hoverable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      aria-labelledby={ariaLabelledby ?? undefined}
      aria-describedby={ariaDescribedby ?? undefined}
      aria-live={ariaLive ?? undefined}
      aria-selected={selectable ? selected : undefined}
    >
      {hasBody && <div className="sol-card-body body-md">{bodyContent}</div>}
      {hasFooter && <div className="sol-card-footer body-md">{footerContent}</div>}
    </div>
  );
};
