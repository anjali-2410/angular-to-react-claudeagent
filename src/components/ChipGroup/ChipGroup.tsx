import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import './ChipGroup.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectedTag {
  [key: string]: unknown;
  icon?: React.ReactNode;
}

interface ChipItem {
  labelText: string;
  primaryValue: string;
  icon?: React.ReactNode;
  originalTag: SelectedTag;
  width?: number;
}

export interface ChipGroupProps {
  /** HTML id for the group root — auto-generated if omitted */
  id?: string;
  /** Array of data objects to display as chips */
  tagsSource?: SelectedTag[];
  /** Shows close button on each chip */
  removable?: boolean;
  /** Size applied to every chip */
  tagSize?: 'small' | 'medium';
  /** How overflow chips are revealed: expand inline or open a popover */
  overflowMode?: 'inline' | 'popover';
  /** Shows Clear All button */
  allowClearAll?: boolean;
  /** Property name in each tag object used as unique key */
  primaryKey?: string;
  /** Property name in each tag object used as display label */
  label?: string;
  /** Maximum chips to show regardless of container width (0 = auto) */
  maxTagsToDisplay?: number;
  /** Label for the Clear All button */
  clearAllLabel?: string;
  /** Label for the Show Less button */
  showLessLabel?: string;
  /** Accessible label for the chip group region */
  chipGroupLabel?: string;
  /** Emitted after any chip is removed — provides updated tags array */
  onTagsChanged?: (event: { tags: SelectedTag[] }) => void;
  /** Emitted when the Show More (+N) button is clicked */
  onViewMoreClicked?: () => void;
  /** Emitted when the Show Less button is clicked */
  onViewLessClicked?: () => void;
  /** Emitted when an individual chip is removed */
  onTagDeleted?: (tag: SelectedTag) => void;
  /** Emitted when Clear All is clicked */
  onDeleteAllClicked?: () => void;
}

const MAX_ALLOWED_TAGS_TO_DISPLAY = 10;

// ── Plus icon SVG ─────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── ChipGroup ─────────────────────────────────────────────────────────────────

export const ChipGroup: React.FC<ChipGroupProps> = ({
  id: idProp,
  tagsSource = [],
  removable = false,
  tagSize = 'small',
  overflowMode = 'inline',
  allowClearAll = true,
  primaryKey = 'id',
  label = 'text',
  maxTagsToDisplay = 0,
  clearAllLabel = 'Clear',
  showLessLabel = 'Show less',
  chipGroupLabel = 'Chip group',
  onTagsChanged,
  onViewMoreClicked,
  onViewLessClicked,
  onTagDeleted,
  onDeleteAllClicked,
}) => {
  const reactId = useId();
  const id = idProp || `sol-chip-group-${reactId}`;

  const tagWrapperRef = useRef<HTMLDivElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const invisibleMoreRef = useRef<HTMLDivElement>(null);
  const invisibleChipRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [visibleItems, setVisibleItems] = useState<ChipItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<ChipItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const debounceRef = useRef<number | undefined>(undefined);
  const currentWidthRef = useRef(0);

  // @floating-ui for popover mode
  const { refs: floatingRefs, floatingStyles } = useFloating({
    open: isPopoverOpen,
    onOpenChange: setIsPopoverOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // ── Process tagsSource into internal ChipItem format ─────────────────────

  const processedTags = useMemo<ChipItem[]>(
    () =>
      tagsSource.map(tag => ({
        labelText: String(tag[label] ?? ''),
        primaryValue: String(tag[primaryKey] ?? ''),
        icon: tag.icon as React.ReactNode | undefined,
        originalTag: tag,
      })),
    [tagsSource, label, primaryKey]
  );

  // ── Overflow calculation (mirrors Angular's prepareItemsToDisplay) ────────

  const computeVisibleItems = useCallback(() => {
    const container = tagWrapperRef.current;
    if (!container) return;

    const parentEl = container.parentElement;
    const containerWidth = Math.max(
      parentEl?.getBoundingClientRect().width || 0,
      container.getBoundingClientRect().width,
      200
    );

    // Collect measured widths from invisible chips
    const items: ChipItem[] = processedTags.map((tag, i) => ({
      ...tag,
      width: invisibleChipRefs.current[i]?.offsetWidth || 0,
    }));

    const effectiveMax = Math.min(maxTagsToDisplay || 0, MAX_ALLOWED_TAGS_TO_DISPLAY);

    if (effectiveMax > 0) {
      setVisibleItems(items.slice(0, effectiveMax));
      setHiddenItems(items.slice(effectiveMax));
      return;
    }

    const safetyBuffer = 16;
    const gapOffset = 4;
    const actualContainerWidth = containerWidth - safetyBuffer;

    let clearAllWidth = 0;
    if (allowClearAll && actionButtonsRef.current) {
      clearAllWidth = Math.max(actionButtonsRef.current.offsetWidth || 0, 60);
    }

    const moreButtonWidth = invisibleMoreRef.current?.offsetWidth || 0;
    const available = actualContainerWidth - clearAllWidth;

    // First pass: can all items fit?
    let remaining = available;
    let allFit = true;
    for (const item of items) {
      remaining -= (item.width || 0) + gapOffset;
      if (remaining < 0) { allFit = false; break; }
    }

    if (allFit) {
      setVisibleItems(items);
      setHiddenItems([]);
      return;
    }

    // Second pass: fit as many as possible leaving room for the +N button
    remaining = available - moreButtonWidth - gapOffset;
    let hiddenStart = -1;

    for (let i = 0; i < items.length; i++) {
      remaining -= (items[i].width || 0) + gapOffset;
      if (remaining < 0) { hiddenStart = i; break; }
    }

    if (hiddenStart === 0) hiddenStart = 1; // always show at least 1
    if (hiddenStart === -1) {
      setVisibleItems(items);
      setHiddenItems([]);
    } else {
      setVisibleItems(items.slice(0, hiddenStart));
      setHiddenItems(items.slice(hiddenStart));
    }
  }, [processedTags, allowClearAll, maxTagsToDisplay]);

  // ── ResizeObserver ────────────────────────────────────────────────────────

  useEffect(() => {
    const el = tagWrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && w !== currentWidthRef.current && !showAll && (maxTagsToDisplay || 0) <= 0) {
          clearTimeout(debounceRef.current);
          debounceRef.current = window.setTimeout(() => {
            computeVisibleItems();
            currentWidthRef.current = w;
          }, 200);
        }
      }
    });

    observer.observe(el);
    // Initial calculation after a tick to let invisible chips measure
    const t = window.setTimeout(computeVisibleItems, 0);
    return () => {
      observer.disconnect();
      clearTimeout(debounceRef.current);
      clearTimeout(t);
    };
  }, [showAll, maxTagsToDisplay, computeVisibleItems]);

  // Re-compute when tags change
  useEffect(() => {
    currentWidthRef.current = 0;
    setShowAll(false);
    const t = window.setTimeout(computeVisibleItems, 0);
    return () => clearTimeout(t);
  }, [processedTags, computeVisibleItems]);

  // ── Announce live message ─────────────────────────────────────────────────

  const announce = useCallback((msg: string) => {
    setLiveMessage('');
    requestAnimationFrame(() => setLiveMessage(msg));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const removeItem = useCallback(
    (item: ChipItem) => {
      const updatedTags = tagsSource.filter(
        t => String(t[primaryKey]) !== item.primaryValue
      );
      onTagDeleted?.(item.originalTag);
      onTagsChanged?.({ tags: updatedTags });
      announce(`Removed ${item.labelText}`);
      if (isPopoverOpen) setIsPopoverOpen(false);
    },
    [tagsSource, primaryKey, onTagDeleted, onTagsChanged, announce, isPopoverOpen]
  );

  const clearAllTags = () => {
    onDeleteAllClicked?.();
    onTagsChanged?.({ tags: [] });
    announce('All tags cleared');
  };

  const handleShowMore = () => {
    if (overflowMode === 'popover') {
      setIsPopoverOpen(open => !open);
    } else {
      setShowAll(true);
    }
    onViewMoreClicked?.();
  };

  const handleShowLess = () => {
    setShowAll(false);
    onViewLessClicked?.();
  };

  // Close popover on outside click
  useEffect(() => {
    if (!isPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      const floatingEl = floatingRefs.floating.current;
      const refEl = floatingRefs.reference.current as Element | null;
      if (floatingEl && !floatingEl.contains(e.target as Node) &&
          refEl && !refEl.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isPopoverOpen, floatingRefs]);

  // Keyboard: Escape closes popover
  useEffect(() => {
    if (!isPopoverOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPopoverOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPopoverOpen]);

  // ── Keyboard navigation within chip group ─────────────────────────────────

  const allVisibleChipRefs = useRef<(HTMLDivElement | null)[]>([]);

  const focusChip = (idx: number) => {
    const chips = tagWrapperRef.current?.querySelectorAll<HTMLElement>('.chip-item .sol-chip');
    chips?.[idx]?.focus();
  };

  const handleChipKeydown = (e: React.KeyboardEvent, chipIndex: number) => {
    const total = visibleItems.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (chipIndex < total - 1) focusChip(chipIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (chipIndex > 0) focusChip(chipIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusChip(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusChip(total - 1);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderChip = (item: ChipItem, chipIndex: number, isHidden = false) => (
    <div
      key={item.primaryValue}
      className={`sol-tag-horizontal ${isHidden ? 'hidden-items' : 'visible-items'} chip-item`}
      ref={el => { allVisibleChipRefs.current[chipIndex] = el; }}
    >
      <Chip
        id={`sol-visible-chip-${item.primaryValue}`}
        chipTabIndex={chipIndex === 0 && !isHidden ? '0' : '-1'}
        allowClose={removable}
        label={item.labelText}
        icon={item.icon ?? undefined}
        size={tagSize}
        data-chip-label={item.labelText}
        data-chip-index={chipIndex + 1}
        onClosed={() => removeItem(item)}
        onChipKeydown={e => handleChipKeydown(e, chipIndex)}
      />
    </div>
  );

  const totalCount = visibleItems.length + hiddenItems.length;
  const showMoreAriaLabel = `Show ${hiddenItems.length} more chips`;

  return (
    <div
      className="sol-chip-group"
      id={id}
      tabIndex={-1}
      role="region"
      aria-describedby={`${id}-description`}
    >
      {/* Screen-reader count announcement */}
      <span id={`${id}-description`} className="sol-screenreader-only">
        {totalCount} tags
      </span>
      {/* Live region for dynamic announcements */}
      <span
        id={`${id}-live`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sol-screenreader-only"
      >
        {liveMessage}
      </span>

      {/* ── Visible tags wrapper ─────────────────────────────────────────── */}
      <div
        ref={tagWrapperRef}
        id={`${id}-tags-content`}
        className={`sol-tags-wrapper${showAll ? ' chip-group-show-all' : ''}`}
        role="group"
        aria-label={chipGroupLabel}
      >
        {visibleItems.map((item, i) => renderChip(item, i))}

        {/* Expanded hidden items (inline mode) */}
        {showAll && hiddenItems.map((item, j) =>
          renderChip(item, visibleItems.length + j, true)
        )}

        {/* Action buttons */}
        <div ref={actionButtonsRef} className="sol-chip-group-buttons-container">
          {hiddenItems.length > 0 && !showAll && (
            <>
              <span id={`show-more-sr-${id}`} className="sol-screenreader-only">
                {showMoreAriaLabel}
              </span>
              <div className="show-more" ref={floatingRefs.setReference as React.Ref<HTMLDivElement>}>
                <Button
                  id={`show-more-container-${id}`}
                  variant="secondary"
                  size={tagSize}
                  ariaLabel={showMoreAriaLabel}
                  ariaLabelledBy={`show-more-sr-${id}`}
                  ariaExpanded={isPopoverOpen}
                  tabIndex={0}
                  icon={<PlusIcon />}
                  onClick={handleShowMore}
                >
                  <span>{hiddenItems.length}</span>
                </Button>
              </div>
            </>
          )}
          {hiddenItems.length > 0 && showAll && (
            <div className="show-less">
              <Button
                id={`show-less-container-${id}`}
                variant="secondary"
                size={tagSize}
                ariaExpanded={showAll}
                tabIndex={0}
                onClick={handleShowLess}
              >
                {showLessLabel}
              </Button>
            </div>
          )}
          {totalCount > 0 && allowClearAll && (
            <>
              <span id={`clear-all-sr-${id}`} className="sol-screenreader-only">
                {clearAllLabel} all tags
              </span>
              <div className="clear-all">
                <Button
                  size={tagSize}
                  variant="tertiary"
                  ariaLabelledBy={`clear-all-sr-${id}`}
                  onClick={clearAllTags}
                >
                  {clearAllLabel}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Popover (overflowMode='popover') ────────────────────────────── */}
      {isPopoverOpen && overflowMode === 'popover' && (
        <div
          ref={floatingRefs.setFloating}
          style={floatingStyles}
          className="sol-chip-group-popover"
          id={`${id}-popover-content`}
          role="dialog"
        >
          {hiddenItems.map((item, j) => (
            <div key={item.primaryValue} className="tag-row">
              {renderChip(item, visibleItems.length + j, true)}
            </div>
          ))}
        </div>
      )}

      {/* ── Invisible chips for width measurement ────────────────────────── */}
      {processedTags.map((tag, i) => (
        <div
          key={tag.primaryValue}
          className="sol-tag-container invisible"
          ref={el => { invisibleChipRefs.current[i] = el; }}
        >
          <Chip
            chipTabIndex="-1"
            allowClose={removable}
            label={tag.labelText}
            icon={tag.icon ?? undefined}
            size={tagSize}
            id={`sol-invisible-chip-${tag.primaryValue}`}
            data-primary-value={tag.primaryValue}
          />
        </div>
      ))}

      {/* Invisible more button for width measurement */}
      <div className="invisible" ref={invisibleMoreRef}>
        <Button variant="secondary" size={tagSize} icon={<PlusIcon />} tabIndex={-1}>
          <span>{hiddenItems.length || 0}</span>
        </Button>
      </div>
    </div>
  );
};
