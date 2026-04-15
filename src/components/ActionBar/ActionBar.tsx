import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import tippy, { type Instance } from 'tippy.js';
import { Button } from '../Button/Button';
import './ActionBar.css';

/** Parse an inline CSS string (e.g. "width:1rem; color:red") to a React CSSProperties object. */
function parseCssString(css: string): React.CSSProperties {
  if (!css) return {};
  return css
    .split(';')
    .filter(Boolean)
    .reduce<React.CSSProperties>((acc, rule) => {
      const idx = rule.indexOf(':');
      if (idx === -1) return acc;
      const prop = rule.slice(0, idx).trim();
      const val = rule.slice(idx + 1).trim();
      if (!prop || !val) return acc;
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return { ...acc, [camel]: val };
    }, {});
}

export interface ActionBarProps {
  /** Whether the action bar is visible */
  showActionBar?: boolean;
  /** Main text content displayed in the bar */
  actionBarTextContent?: string;
  /** SVG sprite icon id for the button */
  buttonIcon?: string;
  /** Button label text */
  buttonText?: string;
  /** Inline CSS string applied to the button icon SVG */
  styleData?: string;
  /** Path to the SVG sprite file */
  iconPath?: string;
  /** Accessibility label for the bar region */
  ariaLabel?: string;
  /** When true, the message uses aria-live="polite" so screen readers announce it */
  liveMessage?: boolean;
  /** Emitted when the action button is clicked */
  onButtonClicked?: () => void;
}

const MAX_LINES = 4;

export const ActionBar: React.FC<ActionBarProps> = ({
  showActionBar = false,
  actionBarTextContent = 'You are currently impersonating Darth Vader on tenant Galactic Empire',
  buttonIcon,
  buttonText,
  styleData,
  iconPath = './assets/application-icons.svg',
  ariaLabel = 'Action bar',
  liveMessage = false,
  onButtonClicked,
}) => {
  const uid = useId();
  const messageId = `sol-action-bar-${uid}-message`;

  const barLabelRef = useRef<HTMLSpanElement>(null);
  const tippyRef = useRef<Instance | null>(null);
  const [isLabelTruncated, setIsLabelTruncated] = useState(false);

  /** Binary-search ellipsis: matches Angular's applyEllipsis implementation. */
  const applyEllipsis = useCallback(
    (element: HTMLSpanElement) => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      if (!lineHeight) {
        setIsLabelTruncated(false);
        return;
      }

      const maxHeight = MAX_LINES * lineHeight;
      element.textContent = actionBarTextContent;

      if (element.scrollHeight <= maxHeight) {
        setIsLabelTruncated(false);
        return;
      }

      let lo = 0;
      let hi = actionBarTextContent.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        element.textContent = actionBarTextContent.slice(0, mid) + '\u2026';
        if (element.scrollHeight <= maxHeight) {
          lo = mid;
        } else {
          hi = mid - 1;
        }
      }
      element.textContent = lo > 0 ? actionBarTextContent.slice(0, lo) + '\u2026' : '\u2026';
      setIsLabelTruncated(true);
    },
    [actionBarTextContent]
  );

  /** ResizeObserver — mirrors Angular's @ViewChild barLabel setter + ngZone.runOutsideAngular. */
  useEffect(() => {
    if (!showActionBar || !barLabelRef.current) return;

    const el = barLabelRef.current;
    applyEllipsis(el);

    const observer = new ResizeObserver(() => applyEllipsis(el));
    observer.observe(el);

    return () => observer.disconnect();
  }, [showActionBar, applyEllipsis]);

  /** Re-apply ellipsis when text content changes while visible (mirrors ngOnChanges). */
  useEffect(() => {
    if (showActionBar && barLabelRef.current) {
      applyEllipsis(barLabelRef.current);
    }
  }, [actionBarTextContent, showActionBar, applyEllipsis]);

  /** tippy.js tooltip — initialise when bar appears, destroy when hidden. */
  useEffect(() => {
    if (!showActionBar || !barLabelRef.current) return;

    tippyRef.current = tippy(barLabelRef.current, {
      content: actionBarTextContent,
      appendTo: () => document.body,
    });

    return () => {
      tippyRef.current?.destroy();
      tippyRef.current = null;
    };
  }, [showActionBar]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Keep tooltip content and enabled state in sync. */
  useEffect(() => {
    if (!tippyRef.current) return;
    tippyRef.current.setContent(actionBarTextContent);
    if (isLabelTruncated) {
      tippyRef.current.enable();
    } else {
      tippyRef.current.disable();
    }
  }, [isLabelTruncated, actionBarTextContent]);

  if (!showActionBar) return null;

  const iconElement =
    buttonIcon ? (
      <svg style={parseCssString(styleData ?? '')} aria-hidden="true">
        <use href={`${iconPath}#${buttonIcon}`} />
      </svg>
    ) : undefined;

  return (
    <div
      className="sol-action-bar"
      role="region"
      aria-label={ariaLabel}
      aria-describedby={messageId}
    >
      <div className="bar-wrapper">
        <span
          ref={barLabelRef}
          id={messageId}
          className="bar-label body-md"
          role={liveMessage ? 'status' : undefined}
          aria-live={liveMessage ? 'polite' : undefined}
          tabIndex={isLabelTruncated ? 0 : undefined}
        >
          {actionBarTextContent}
        </span>
        <Button
          variant="secondary"
          size="small"
          icon={iconElement}
          onClick={onButtonClicked}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
