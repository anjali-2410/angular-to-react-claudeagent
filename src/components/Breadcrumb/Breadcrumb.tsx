import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import tippy, { type Instance } from 'tippy.js';
import { Button } from '../Button/Button';
import './Breadcrumb.css';

/** Maximum levels visible without an overflow menu (mirrors Angular MAX_VISIBLE_LEVELS). */
const MAX_VISIBLE_LEVELS = 4;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Display text */
  label: string;
  /** Router path — emits onItemClicked when clicked */
  path?: string;
  /** Custom click handler — called directly without emitting onItemClicked */
  handler?: () => void;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items (required) */
  items: BreadcrumbItem[];
  /** Accessible label for the nav landmark */
  ariaLabel?: string;
  /** Emitted when a navigable item (path) is clicked */
  onItemClicked?: (data: { item: BreadcrumbItem; event: Event }) => void;
}

interface OverflowState {
  hideCurrentPage: boolean;
  hideHome: boolean;
  hideMiddleItems: boolean;
  truncateSecondToLast: boolean;
}

const RESET_OVERFLOW: OverflowState = {
  hideCurrentPage: false,
  hideHome: false,
  hideMiddleItems: false,
  truncateSecondToLast: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Wait one animation frame — equivalent to Angular's queueMicrotask + requestAnimationFrame. */
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/** Horizontal dots SVG for the overflow menu button (replaces Angular's sol-dots-horizontal icon). */
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="3.5" cy="10" r="2" />
    <circle cx="10" cy="10" r="2" />
    <circle cx="16.5" cy="10" r="2" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  ariaLabel = 'Breadcrumb',
  onItemClicked,
}) => {
  const navRef = useRef<HTMLElement>(null);
  const menuContainerRef = useRef<HTMLLIElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const lastWidthRef = useRef(0);
  const tippyRef = useRef<Instance | null>(null);

  const [overflow, setOverflow] = useState<OverflowState>(RESET_OVERFLOW);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const itemCount = items.length;

  // ── Overflow measurement ─────────────────────────────────────────────────

  const measureItemsWidth = useCallback((): number => {
    const container = navRef.current;
    if (!container) return 0;
    const list = container.querySelector('ol');
    if (!list) return 0;
    const lis = container.querySelectorAll('li');
    let total = 0;
    lis.forEach(li => { total += Math.max((li as HTMLElement).offsetWidth, (li as HTMLElement).scrollWidth); });
    const gap = parseFloat(window.getComputedStyle(list).gap) || 8;
    if (lis.length > 1) total += gap * (lis.length - 1);
    return total;
  }, []);

  /**
   * Progressive overflow check — mirrors Angular's checkOverflow + applyStage2For4Items.
   * Uses flushSync to force synchronous React re-renders between stages so DOM measurements
   * are accurate (equivalent to Angular's detectChanges between stages).
   */
  const checkOverflow = useCallback(async (count: number, containerW: number) => {
    if (count <= 1) { flushSync(() => setOverflow(RESET_OVERFLOW)); return; }

    flushSync(() => setOverflow(RESET_OVERFLOW));
    await nextFrame();

    if (measureItemsWidth() < containerW) return;

    // Stage 1 — hide current page
    flushSync(() => setOverflow(p => ({ ...p, hideCurrentPage: true })));
    await nextFrame();
    if (count === 2) return;
    if (measureItemsWidth() < containerW - 10) return;

    // 4-item special flow
    if (count === 4) {
      flushSync(() => setOverflow(p => ({ ...p, hideMiddleItems: true })));
      await nextFrame();
      if (measureItemsWidth() <= containerW) return;

      flushSync(() => setOverflow(p => ({ ...p, hideHome: true })));
      await nextFrame();
      if (measureItemsWidth() <= containerW) return;

      flushSync(() => setOverflow(p => ({ ...p, truncateSecondToLast: true })));
      return;
    }

    // 3 items and 5+ items — hide home
    flushSync(() => setOverflow(p => ({ ...p, hideHome: true })));
    await nextFrame();
    if (measureItemsWidth() < containerW - 10) return;

    flushSync(() => setOverflow(p => ({ ...p, truncateSecondToLast: true })));
  }, [measureItemsWidth]);

  // ResizeObserver — re-runs whenever items change
  useEffect(() => {
    const container = navRef.current;
    if (!container) return;

    lastWidthRef.current = 0; // reset so initial check always runs
    checkOverflow(itemCount, container.offsetWidth);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        if (Math.abs(lastWidthRef.current - w) < 5) return;
        lastWidthRef.current = w;
        clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => checkOverflow(itemCount, w), 100);
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(debounceRef.current);
    };
  }, [items, itemCount, checkOverflow]);

  // ── Tooltip for truncated second-to-last item ───────────────────────────

  const secondToLastLabel = itemCount >= 2 ? items[itemCount - 2]?.label : undefined;

  /** Callback ref on the truncated element — creates/destroys tippy when truncation changes. */
  const truncatedRef = useCallback((el: HTMLElement | null) => {
    tippyRef.current?.destroy();
    tippyRef.current = null;
    if (el && secondToLastLabel) {
      tippyRef.current = tippy(el, {
        content: secondToLastLabel,
        appendTo: () => document.body,
      });
    }
  }, [secondToLastLabel, overflow.truncateSecondToLast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { tippyRef.current?.destroy(); }, []);

  // ── Click-outside to close menu ─────────────────────────────────────────

  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuContainerRef.current?.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  // ── Derived state (mirrors Angular computed signals) ────────────────────

  const shouldShowMenu = useMemo(
    () => itemCount > MAX_VISIBLE_LEVELS || overflow.hideHome || overflow.hideMiddleItems,
    [itemCount, overflow.hideHome, overflow.hideMiddleItems]
  );

  const showHome = useMemo(
    () => itemCount >= 2 && !overflow.hideHome,
    [itemCount, overflow.hideHome]
  );

  const middleItems = useMemo(() => {
    if (itemCount !== 4 || overflow.hideMiddleItems) return [];
    return [items[1]];
  }, [itemCount, items, overflow.hideMiddleItems]);

  const showSecondToLast = itemCount >= 3;
  const secondToLastItem = itemCount >= 2 ? items[itemCount - 2] : null;
  const showLastItem = !overflow.hideCurrentPage;
  const lastItem = itemCount > 0 ? items[itemCount - 1] : null;

  const menuItems = useMemo(() => {
    if (itemCount <= 2) return [];
    if (overflow.hideHome) return items.slice(0, -2);
    if (overflow.hideMiddleItems && itemCount === 4) return [items[1]];
    if (itemCount > MAX_VISIBLE_LEVELS) return items.slice(1, itemCount - 2);
    return [];
  }, [items, itemCount, overflow.hideHome, overflow.hideMiddleItems]);

  // ── Event handlers ──────────────────────────────────────────────────────

  const isNavigable = (item: BreadcrumbItem) => !!(item.path || item.handler);

  const handleItemClick = (item: BreadcrumbItem, e: React.MouseEvent | React.KeyboardEvent) => {
    if (item.path) {
      e.preventDefault();
      onItemClicked?.({ item, event: e.nativeEvent });
    } else if (item.handler) {
      e.preventDefault();
      try { item.handler(); } catch (err) { console.error('Breadcrumb handler error:', err); }
    }
  };

  const handleMenuItemClick = (item: BreadcrumbItem) => {
    setIsMenuOpen(false);
    if (item.path) {
      onItemClicked?.({ item, event: new MouseEvent('click') });
    } else if (item.handler) {
      try { item.handler(); } catch (err) { console.error('Breadcrumb handler error:', err); }
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────

  const Separator = () => (
    <span className="sol-breadcrumb-separator body-md" aria-hidden="true">/</span>
  );

  const renderItem = (item: BreadcrumbItem, truncate = false, ref?: React.Ref<HTMLElement>) => {
    if (isNavigable(item)) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={item.path || '#'}
          role={!item.path ? 'link' : undefined}
          tabIndex={!item.path ? 0 : undefined}
          className={`sol-breadcrumb-link body-md${truncate ? ' sol-breadcrumb-link-truncated' : ''}`}
          onClick={e => handleItemClick(item, e)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleItemClick(item, e);
            if (e.key === ' ') { e.preventDefault(); handleItemClick(item, e); }
          }}
        >
          {item.label}
        </a>
      );
    }
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={`sol-breadcrumb-text body-md${truncate ? ' sol-breadcrumb-text-truncated' : ''}`}
      >
        {item.label}
      </span>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <nav ref={navRef as React.Ref<HTMLElement>} aria-label={ariaLabel} className="sol-breadcrumb">
      <ol className="sol-breadcrumb-list">

        {/* Home (first item) — hidden in Stage 2 */}
        {showHome && (
          <li className="sol-breadcrumb-item">
            {renderItem(items[0])}
            {(shouldShowMenu || middleItems.length > 0 || showSecondToLast || showLastItem) && <Separator />}
          </li>
        )}

        {/* Collapse menu button — shown when items > 4 or Home is hidden */}
        {shouldShowMenu && (
          <li ref={menuContainerRef} className="sol-breadcrumb-item sol-breadcrumb-item-menu">
            <div className="sol-breadcrumb-menu-wrapper">
              <Button
                variant="tertiary"
                size="small"
                ariaLabel="Show more breadcrumb items"
                ariaExpanded={isMenuOpen}
                icon={<DotsIcon />}
                onClick={() => setIsMenuOpen(open => !open)}
              />
              {isMenuOpen && menuItems.length > 0 && (
                <ul className="sol-breadcrumb-dropdown" role="menu">
                  {menuItems.map((item, i) => (
                    <li key={i} className="sol-breadcrumb-dropdown-item" role="none">
                      <button
                        role="menuitem"
                        title={item.label}
                        onClick={() => handleMenuItemClick(item)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {(middleItems.length > 0 || showSecondToLast || showLastItem) && <Separator />}
          </li>
        )}

        {/* Middle items — shown only for exactly 4 items when not hidden */}
        {middleItems.map((item, i) => (
          <li key={i} className="sol-breadcrumb-item">
            {renderItem(item)}
            <Separator />
          </li>
        ))}

        {/* Second-to-last item — hidden at Stage 1 only for certain flows */}
        {showSecondToLast && secondToLastItem && (
          <li className="sol-breadcrumb-item sol-breadcrumb-item-second-to-last">
            {renderItem(
              secondToLastItem,
              overflow.truncateSecondToLast,
              overflow.truncateSecondToLast ? truncatedRef : undefined
            )}
            {showLastItem && <Separator />}
          </li>
        )}

        {/* Last item (current page) — hidden in Stage 1 */}
        {showLastItem && lastItem && (
          <li className="sol-breadcrumb-item sol-breadcrumb-item-last">
            <span
              className="sol-breadcrumb-text sol-breadcrumb-text-last body-md"
              aria-current="page"
              aria-hidden="true"
            >
              {lastItem.label}
            </span>
          </li>
        )}

      </ol>
    </nav>
  );
};
