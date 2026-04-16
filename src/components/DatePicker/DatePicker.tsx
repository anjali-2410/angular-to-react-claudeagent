import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react';
import { Calendar } from '../Calendar/Calendar';
import { Button } from '../Button/Button';
import type { SpecialDates } from '../Calendar/Calendar';
import './DatePicker.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  /** The id attribute for the root element and inner text input */
  id?: string;
  /** Date format string. If it contains `h:mm`, the time picker is activated. */
  dateFormat?: string;
  /** Show the Today footer button */
  displayFooter?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Special date indicators */
  specialDates?: SpecialDates[];
  /** Starting day of week (0 = Sunday) */
  startDOW?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Days of week to disable (0 = Sunday) */
  daysDisabled?: number[];
  /** Show previous/next day navigation buttons */
  prevNextButtons?: boolean;
  /** Position of prev/next buttons */
  arrowPosition?: 'left' | 'right';
  /** Allow user to enter any valid time */
  allowAnyValidTime?: boolean;
  /** Time picker step in minutes */
  steps?: number;
  /** Disable the component */
  disabled?: boolean;
  /** Make read-only */
  readonly?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Time format for the time picker dropdown */
  timeFormat?: string;
  /** Mark field as required */
  required?: boolean;
  /** Allow manual text entry */
  allowTextInput?: boolean;
  /** Aria label for the input */
  ariaLabel?: string;
  /** Aria labelledby for the input */
  ariaLabelledby?: string | null;
  /** Visible label text */
  label?: string;
  /** External error message */
  errorMessage?: string;
  /** Controlled value */
  value?: Date | null;
  /** Called when the selected date changes */
  onChange?: (date: Date | null) => void;
  /** Additional class name */
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIME_REGEX = /\bh:mm\b|\bhh:mm\b|\bhh:mm:ss\b/;

/** Format a Date using a simplified Angular-style date format string. */
function formatDate(date: Date | null, format: string, locale = 'en-US'): string {
  if (!date) return '';
  try {
    // Map common Angular DatePipe tokens to Intl options
    const hasTime = TIME_REGEX.test(format);
    if (hasTime) {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    }
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/** Parse a user-entered date string into a Date or null. */
function parseDate(str: string): Date | null {
  if (!str.trim()) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d;
}

/** Check whether a day-of-week number is in the disabled list. */
function isDayDisabled(date: Date, daysDisabled: number[]): boolean {
  return daysDisabled.includes(date.getDay());
}

/** Skip disabled days forward. */
function nextNonDisabled(date: Date, daysDisabled: number[]): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  if (isDayDisabled(next, daysDisabled)) return nextNonDisabled(next, daysDisabled);
  return next;
}

/** Skip disabled days backward. */
function prevNonDisabled(date: Date, daysDisabled: number[]): Date {
  const prev = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  if (isDayDisabled(prev, daysDisabled)) return prevNonDisabled(prev, daysDisabled);
  return prev;
}

/** Format hours + minutes using an Angular-style time format string. */
function formatTimeStr(h: number, m: number, format?: string): string {
  const mm = String(m).padStart(2, '0');
  if (!format) {
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  }
  if (format.includes('HH')) {
    return `${String(h).padStart(2, '0')}:${mm}`;
  }
  if (/\bH\b/.test(format)) {
    return `${h}:${mm}`;
  }
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  if (format.includes('hh')) {
    return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
  }
  return `${h12}:${mm} ${ampm}`;
}

/** Parse a formatted time string back into {hour, minute} using the same format. */
function parseTimeStr(timeStr: string, format?: string): { hour: number; minute: number } | null {
  const str = timeStr.trim();
  if (format && (format.includes('HH') || /\bH\b/.test(format))) {
    const match = str.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = Number.parseInt(match[1], 10);
    const min = Number.parseInt(match[2], 10);
    if (h > 23 || min > 59) return null;
    return { hour: h, minute: min };
  }
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = Number.parseInt(match[1], 10);
  const min = Number.parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return { hour: h, minute: min };
}

/** Generate time options for a 24-hour day at `step`-minute intervals. */
function buildTimeOptions(steps: number, format?: string): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += steps) {
      options.push(formatTimeStr(h, m, format));
    }
  }
  return options;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      id,
      dateFormat = 'MMM d, y',
      displayFooter = true,
      minDate,
      maxDate,
      specialDates = [],
      startDOW = 0,
      daysDisabled = [],
      prevNextButtons = true,
      arrowPosition = 'right',
      allowAnyValidTime = false,
      steps = 15,
      disabled = false,
      readonly = false,
      placeholder = '',
      timeFormat,
      required = false,
      allowTextInput = true,
      ariaLabel = '',
      ariaLabelledby = null,
      label,
      errorMessage,
      value,
      onChange,
      className,
    },
    ref
  ) => {
    const componentId = useId();
    const inputId = id || `sol-date-picker-${componentId}`;
    const errorId = `${inputId}-error`;
    const formatHintId = `${inputId}-format-hint`;
    const selectedDateHintId = `${inputId}-selected-date`;

    const showTime = TIME_REGEX.test(dateFormat);

    // ── State ──────────────────────────────────────────────────────────────────

    const [selectedDate, setSelectedDate] = useState<Date | null>(value ?? null);
    const [inputText, setInputText] = useState<string>(() => formatDate(value ?? null, dateFormat));
    const [internalError, setInternalError] = useState<string | undefined>(undefined);
    const [liveAnnouncement, setLiveAnnouncement] = useState('');
    const [timeSearch, setTimeSearch] = useState('');

    const liveAnnouncementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const preOverlayDate = useRef<Date | null>(null);

    // ── Floating UI (popover) ──────────────────────────────────────────────────

    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: (open) => {
        setIsOpen(open);
        if (!open) handleOverlayClose();
      },
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(4),
        flip({ fallbackAxisSideDirection: 'start' }),
        shift(),
      ],
      placement: 'bottom-start',
    });

    const click = useClick(context, { enabled: !disabled && !readonly });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

    // ── Sync value prop ────────────────────────────────────────────────────────

    useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
        setInputText(formatDate(value, dateFormat));
        setInternalError(undefined);
      }
    }, [value, dateFormat]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const emitChange = useCallback(
      (date: Date | null) => {
        onChange?.(date);
      },
      [onChange]
    );

    const isWithinRange = useCallback((): boolean => {
      if (minDate && maxDate) {
        const today = new Date();
        return today >= minDate && today <= maxDate;
      }
      return true;
    }, [minDate, maxDate]);

    const handleOverlayClose = useCallback(
      (newDate?: Date | null) => {
        if (required && !selectedDate) {
          setInternalError('This field is required');
        }
        if (newDate instanceof Date) {
          const preDate = preOverlayDate.current;
          const hasChanged = !preDate || newDate.getTime() !== preDate.getTime();
          preOverlayDate.current = null;
          if (hasChanged) {
            const formatted = formatDate(newDate, dateFormat);
            if (liveAnnouncementTimer.current) clearTimeout(liveAnnouncementTimer.current);
            setLiveAnnouncement(`${formatted} selected`);
            liveAnnouncementTimer.current = setTimeout(() => setLiveAnnouncement(''), 1000);
          }
        }
      },
      [required, selectedDate, dateFormat]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (liveAnnouncementTimer.current) clearTimeout(liveAnnouncementTimer.current);
      };
    }, []);

    // ── Calendar date selection ────────────────────────────────────────────────

    const handleDateSelected = useCallback(
      (calValue: Date | import('../Calendar/Calendar').CalendarValue) => {
        const date = calValue instanceof Date ? calValue : null;
        if (!date) return;
        if (isDayDisabled(date, daysDisabled)) {
          setInternalError('Entered date is disabled');
          return;
        }
        const newDate = new Date(date);
        setSelectedDate(newDate);
        setInputText(formatDate(newDate, dateFormat));
        setInternalError(undefined);
        emitChange(newDate);
        if (!showTime) {
          setIsOpen(false);
          handleOverlayClose(newDate);
        }
      },
      [daysDisabled, dateFormat, emitChange, showTime, handleOverlayClose]
    );

    // ── Time selection ─────────────────────────────────────────────────────────

    const handleTimeSelect = useCallback(
      (timeStr: string) => {
        const parsed = parseTimeStr(timeStr, timeFormat);
        if (!parsed) return;
        const base = selectedDate ? new Date(selectedDate) : new Date();
        base.setHours(parsed.hour, parsed.minute, 0, 0);
        setSelectedDate(base);
        setInputText(formatDate(base, dateFormat));
        setInternalError(undefined);
        emitChange(base);
        setIsOpen(false);
        handleOverlayClose(base);
      },
      [selectedDate, dateFormat, timeFormat, emitChange, handleOverlayClose]
    );

    // ── allowAnyValidTime: accept typed time on Enter ─────────────────────────

    const handleTimeInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!allowAnyValidTime || e.key !== 'Enter') return;
        e.preventDefault();
        handleTimeSelect(timeSearch);
        setTimeSearch('');
      },
      [allowAnyValidTime, timeSearch, handleTimeSelect]
    );

    // ── Today button ───────────────────────────────────────────────────────────

    const selectToday = useCallback(() => {
      if (!isWithinRange()) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isDayDisabled(today, daysDisabled)) return;
      setSelectedDate(today);
      setInputText(formatDate(today, dateFormat));
      setInternalError(undefined);
      emitChange(today);
    }, [isWithinRange, daysDisabled, dateFormat, emitChange]);

    // ── Prev/Next buttons ──────────────────────────────────────────────────────

    const handlePrev = useCallback(() => {
      if (!selectedDate) return;
      if (minDate && selectedDate <= minDate) return;
      const prev = prevNonDisabled(selectedDate, daysDisabled);
      prev.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds());
      setSelectedDate(prev);
      setInputText(formatDate(prev, dateFormat));
      setInternalError(undefined);
      emitChange(prev);
    }, [selectedDate, minDate, daysDisabled, dateFormat, emitChange]);

    const handleNext = useCallback(() => {
      if (!selectedDate) return;
      if (maxDate && selectedDate >= maxDate) return;
      const next = nextNonDisabled(selectedDate, daysDisabled);
      next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds());
      setSelectedDate(next);
      setInputText(formatDate(next, dateFormat));
      setInternalError(undefined);
      emitChange(next);
    }, [selectedDate, maxDate, daysDisabled, dateFormat, emitChange]);

    // ── Text input handling ────────────────────────────────────────────────────

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
    }, []);

    const handleInputBlur = useCallback(() => {
      const trimmed = inputText.trim();
      if (!trimmed) {
        setSelectedDate(null);
        setInternalError(undefined);
        emitChange(null);
        if (required) setInternalError('This field is required');
        return;
      }
      const parsed = parseDate(trimmed);
      if (!parsed) {
        setInternalError('Not a valid date');
        setSelectedDate(null);
        emitChange(null);
        return;
      }
      if (isDayDisabled(parsed, daysDisabled)) {
        setInternalError('Entered date is disabled');
        setSelectedDate(null);
        emitChange(null);
        return;
      }
      if ((minDate && parsed < minDate) || (maxDate && parsed > maxDate)) {
        setInternalError('Not a valid date');
        setSelectedDate(null);
        emitChange(null);
        return;
      }
      setSelectedDate(parsed);
      setInputText(formatDate(parsed, dateFormat));
      setInternalError(undefined);
      emitChange(parsed);
    }, [inputText, required, daysDisabled, minDate, maxDate, dateFormat, emitChange]);

    // ── Calendar icon click ────────────────────────────────────────────────────

    const handleCalendarIconClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || readonly) return;
        preOverlayDate.current = selectedDate ? new Date(selectedDate) : null;
        setIsOpen(prev => !prev);
      },
      [disabled, readonly, selectedDate]
    );

    // ── Derived state ──────────────────────────────────────────────────────────

    const displayError = errorMessage || internalError;
    const hasError = !!displayError;
    const inputReadonly = readonly || !allowTextInput || isOpen;

    const isPrevDisabled =
      disabled || !selectedDate || isOpen || (minDate ? selectedDate <= minDate : false);
    const isNextDisabled =
      disabled || !selectedDate || isOpen || (maxDate ? selectedDate >= maxDate : false);

    const computedAriaLabel = ariaLabelledby ? '' : ariaLabel;

    const ariaDescribedby = [
      formatHintId,
      ...(selectedDate ? [selectedDateHintId] : []),
      ...(hasError && !disabled && !readonly ? [errorId] : []),
    ].join(' ');

    const timeOptions = buildTimeOptions(steps, timeFormat);
    const filteredTimeOptions = timeSearch
      ? timeOptions.filter(t => t.toLowerCase().startsWith(timeSearch.toLowerCase()))
      : timeOptions;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
      <div
        ref={ref}
        id={id}
        data-testid="sol-date-picker"
        className={[
          'sol-date-picker',
          disabled ? 'disabled' : '',
          readonly ? 'readonly' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Screenreader live region */}
        <span className="sol-screenreader-only" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </span>
        {/* Format hint */}
        <span id={formatHintId} className="sol-screenreader-only">
          {`Date format: ${dateFormat}`}
        </span>
        {/* Selected date hint */}
        {selectedDate && (
          <span id={selectedDateHintId} className="sol-screenreader-only">
            {`Selected date: ${formatDate(selectedDate, dateFormat)}`}
          </span>
        )}

        {/* Visible label */}
        {label && (
          <label
            htmlFor={inputId}
            className="sol-label"
          >
            {label}
          </label>
        )}

        {/* Input row */}
        <div className="sol-input-container-date-picker">
          <div className="input-text">
            {/* Left arrow buttons */}
            {prevNextButtons && arrowPosition === 'left' && !readonly && (
              <div className="button-container" style={!label ? { marginTop: 0 } : undefined}>
                <Button
                  variant="secondary"
                  size="large"
                  icon={<LeftChevronIcon />}
                  disabled={isPrevDisabled}
                  ariaLabel="Previous day"
                  onClick={handlePrev}
                />
                <Button
                  variant="secondary"
                  size="large"
                  icon={<RightChevronIcon />}
                  disabled={isNextDisabled}
                  ariaLabel="Next day"
                  onClick={handleNext}
                />
              </div>
            )}

            {/* Text input wrapper — also the floating anchor */}
            <div
              className="input-wrapper"
              ref={refs.setReference}
              {...getReferenceProps()}
            >
              <div
                className={[
                  'sol-input-container',
                  disabled ? 'disabled' : '',
                  hasError && !disabled && !readonly ? 'error' : '',
                ].filter(Boolean).join(' ')}
              >
                <input
                  id={inputId}
                  className="sol-input"
                  type="text"
                  value={inputText}
                  placeholder={placeholder}
                  readOnly={inputReadonly}
                  disabled={disabled}
                  required={required}
                  aria-label={computedAriaLabel || undefined}
                  aria-labelledby={ariaLabelledby || undefined}
                  aria-describedby={ariaDescribedby}
                  aria-invalid={hasError && !disabled && !readonly ? true : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onClick={e => e.stopPropagation()}
                />
                {/* Calendar icon */}
                {!readonly && !disabled ? (
                  <button
                    type="button"
                    className="sol-icon-button"
                    aria-label="Open date picker"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                    tabIndex={-1}
                    onClick={handleCalendarIconClick}
                  >
                    <CalendarIcon />
                  </button>
                ) : (
                  <span className="sol-icon" aria-hidden="true">
                    <CalendarIcon />
                  </span>
                )}
              </div>
            </div>

            {/* Right arrow buttons */}
            {prevNextButtons && arrowPosition === 'right' && !readonly && (
              <div className="button-container" style={!label ? { marginTop: 0 } : undefined}>
                <Button
                  variant="secondary"
                  size="large"
                  icon={<LeftChevronIcon />}
                  disabled={isPrevDisabled}
                  ariaLabel="Previous day"
                  onClick={handlePrev}
                />
                <Button
                  variant="secondary"
                  size="large"
                  icon={<RightChevronIcon />}
                  disabled={isNextDisabled}
                  ariaLabel="Next day"
                  onClick={handleNext}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {displayError && !disabled && !readonly && (
          <div id={errorId} className="sol-error-message" role="alert">
            {displayError}
          </div>
        )}

        {/* Floating popover */}
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                className="sol-datepicker-wrapper"
                role="dialog"
                aria-modal="true"
                aria-label="Date picker"
                {...getFloatingProps()}
              >
                <div className={`date-time-container${showTime ? '' : ' no-time'}`}>
                  {/* Calendar */}
                  <div className="calendar-container">
                    <Calendar
                      type="single-selection"
                      daysDisabled={daysDisabled}
                      min={minDate}
                      max={maxDate}
                      startingDay={startDOW as 0 | 1 | 2 | 3 | 4 | 5 | 6}
                      specialDates={specialDates}
                      value={selectedDate ?? undefined}
                      onDateSelected={handleDateSelected}
                    />
                    {/* Footer with Today button */}
                    {displayFooter && (
                      <div className="footer">
                        <Button
                          variant="tertiary"
                          size="medium"
                          disabled={!isWithinRange()}
                          disabledAltState={true}
                          ariaLabel="Go to today"
                          onClick={selectToday}
                        >
                          Today
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Time picker */}
                  {showTime && (
                    <div className="timepicker-container">
                      <div className="timepicker">
                        <div className="sol-input-container timepicker-input">
                          <input
                            className="sol-input"
                            type="text"
                            placeholder="Select time"
                            value={timeSearch}
                            onChange={e => setTimeSearch(e.target.value)}
                            onKeyDown={handleTimeInputKeyDown}
                            aria-label="Enter time"
                          />
                        </div>
                        <ul className="time-options-list" role="listbox" aria-label="Time options">
                          {filteredTimeOptions.map(t => (
                            <li
                              key={t}
                              role="option"
                              className="time-option"
                              aria-selected={
                                selectedDate
                                  ? formatTimeFromDate(selectedDate, timeFormat) === t
                                  : false
                              }
                              onClick={() => handleTimeSelect(t)}
                              onKeyDown={e => e.key === 'Enter' && handleTimeSelect(t)}
                              tabIndex={0}
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

// ── Internal helpers ───────────────────────────────────────────────────────────

function formatTimeFromDate(date: Date, format?: string): string {
  return formatTimeStr(date.getHours(), date.getMinutes(), format);
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16.5 2H14V1C14 0.45 13.55 0 13 0C12.45 0 12 0.45 12 1V2H8V1C8 0.45 7.55 0 7 0C6.45 0 6 0.45 6 1V2H3.5C2.12 2 1 3.12 1 4.5V17.5C1 18.88 2.12 20 3.5 20H16.5C17.88 20 19 18.88 19 17.5V4.5C19 3.12 17.88 2 16.5 2ZM17 17.5C17 17.78 16.78 18 16.5 18H3.5C3.22 18 3 17.78 3 17.5V8H17V17.5ZM17 6H3V4.5C3 4.22 3.22 4 3.5 4H6V5C6 5.55 6.45 6 7 6C7.55 6 8 5.55 8 5V4H12V5C12 5.55 12.45 6 13 6C13.55 6 14 5.55 14 5V4H16.5C16.78 4 17 4.22 17 4.5V6Z"
      fill="currentColor"
    />
  </svg>
);

const LeftChevronIcon = () => (
  <svg
    width="6.4"
    height="12.8"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M0.981181 6.20399L6.11326 0.791051C6.35477 0.536325 6.77741 0.536325 7.01892 0.791051C7.26043 1.04578 7.26043 1.49155 7.01892 1.74627L2.18873 6.8408L7.01892 12.2537C7.26043 12.5085 7.26043 12.9542 7.01892 13.209C6.77741 13.4637 6.35477 13.4637 6.11326 13.209L0.981181 7.47762C0.800049 7.28657 0.800049 7.09553 0.800049 6.90448C0.800049 6.58608 0.860426 6.33135 0.981181 6.20399Z"
      fill="currentColor"
    />
  </svg>
);

const RightChevronIcon = () => (
  <svg
    width="6.4"
    height="12.8"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7.01892 6.20399L1.88684 0.791051C1.64533 0.536325 1.22269 0.536325 0.981181 0.791051C0.739671 1.04578 0.739671 1.49155 0.981181 1.74627L5.81137 6.8408L0.981181 12.2537C0.739671 12.5085 0.739671 12.9542 0.981181 13.209C1.22269 13.4637 1.64533 13.4637 1.88684 13.209L7.01892 7.47762C7.20005 7.28657 7.20005 7.09553 7.20005 6.90448C7.20005 6.58608 7.13967 6.33135 7.01892 6.20399Z"
      fill="currentColor"
    />
  </svg>
);
