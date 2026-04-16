import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  DayPicker,
  useDayPicker,
  type CalendarMonth,
  type DateRange as RDPDateRange,
  type Matcher,
  type ModifiersClassNames,
} from 'react-day-picker';
import { Button } from '../Button/Button';
import './Calendar.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface SpecialDates {
  date: Date;
  status: 'partial' | 'full';
}

export type CalendarType =
  | 'single-selection'
  | 'multi-single-selection'
  | 'week-selection'
  | 'multi-week-selection'
  | 'range-selection';

export type CalendarValue = Date | Date[] | DateRange | DateRange[];

export interface CalendarProps {
  /** Selection mode */
  type?: CalendarType;
  /** Day-of-week numbers to disable (0=Sun … 6=Sat) */
  daysDisabled?: number[];
  /** Show ISO week numbers */
  displayWeeks?: boolean;
  /** First day of the week (0=Sun … 6=Sat) */
  startingDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Minimum selectable date (inclusive) */
  min?: Date | null;
  /** Maximum selectable date (inclusive) */
  max?: Date | null;
  /** Dates to highlight with a partial/full event indicator */
  specialDates?: SpecialDates[];
  /** External aria-describedby id */
  ariaDescribedby?: string | null;
  /** Controlled value */
  value?: CalendarValue;
  /** Called when selection changes */
  onChange?: (value: CalendarValue) => void;
  /** Mirrors Angular's (dateSelected) output */
  onDateSelected?: (value: CalendarValue) => void;
  /** Locale string for month/weekday formatting (default: browser locale) */
  locale?: string;
}

// ── Week utilities ─────────────────────────────────────────────────────────────

/** Compute a full week range containing `date`, honouring `startingDay`. */
function getWeekRange(date: Date, startingDay: number): { start: Date; end: Date } {
  const dow = date.getDay();
  const daysBack = (dow - startingDay + 7) % 7;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(date.getDate() - daysBack);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

/** Toggle a week in a multi-week array. */
function toggleWeek(weeks: DateRange[], date: Date, startingDay: number): DateRange[] {
  const { start, end } = getWeekRange(date, startingDay);
  const idx = weeks.findIndex(w => w.start?.toISOString() === start.toISOString());
  if (idx >= 0) return weeks.filter((_, i) => i !== idx);
  return [...weeks, { start, end }];
}

/** Check if a date falls within a week range. */
function isInRange(date: Date, range: { start: Date; end: Date } | null | undefined): boolean {
  if (!range?.start || !range?.end) return false;
  return date >= range.start && date <= range.end;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

const PrevChevronIcon = () => (
  <svg width="6.4" height="12.8" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0.981181 6.20399L6.11326 0.791051C6.35477 0.536325 6.77741 0.536325 7.01892 0.791051C7.26043 1.04578 7.26043 1.49155 7.01892 1.74627L2.18873 6.8408L7.01892 12.2537C7.26043 12.5085 7.26043 12.9542 7.01892 13.209C6.77741 13.4637 6.35477 13.4637 6.11326 13.209L0.981181 7.47762C0.800049 7.28657 0.800049 7.09553 0.800049 6.90448C0.800049 6.58608 0.860426 6.33135 0.981181 6.20399Z" fill="currentColor" />
  </svg>
);

const NextChevronIcon = () => (
  <svg width="6.4" height="12.8" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7.01892 6.20399L1.88684 0.791051C1.64533 0.536325 1.22269 0.536325 0.981181 0.791051C0.739671 1.04578 0.739671 1.49155 0.981181 1.74627L5.81137 6.8408L0.981181 12.2537C0.739671 12.5085 0.739671 12.9542 0.981181 13.209C1.22269 13.4637 1.64533 13.4637 1.88684 13.209L7.01892 7.47762C7.20005 7.28657 7.20005 7.09553 7.20005 6.90448C7.20005 6.58608 7.13967 6.33135 7.01892 6.20399Z" fill="currentColor" />
  </svg>
);

// ── Custom calendar header (replaces Angular's CalendarHeaderComponent) ────────

interface CalendarHeaderProps {
  calendarMonth: CalendarMonth;
  displayIndex: number;
  locale?: string;
}

function CalendarCaptionComponent({ calendarMonth, locale }: CalendarHeaderProps) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();

  const periodLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
        calendarMonth.date
      ),
    [calendarMonth.date, locale]
  );

  return (
    <div className="sol-calendar-header">
      <Button
        variant="tertiary"
        size="large"
        ariaLabel="Previous month"
        disabled={!previousMonth}
        disabledAltState={!previousMonth}
        icon={<PrevChevronIcon />}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      />
      <span className="sol-calendar-header-label body-md-emphasized" aria-live="polite" aria-atomic="true">
        <Button variant="tertiary" size="large" ariaLabel={periodLabel}>
          {periodLabel}
        </Button>
      </span>
      <Button
        variant="tertiary"
        size="large"
        ariaLabel="Next month"
        disabled={!nextMonth}
        disabledAltState={!nextMonth}
        icon={<NextChevronIcon />}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      />
    </div>
  );
}

// ── Main Calendar component ────────────────────────────────────────────────────

export const Calendar: React.FC<CalendarProps> = ({
  type = 'single-selection',
  daysDisabled = [],
  displayWeeks = false,
  startingDay = 0,
  min = null,
  max = null,
  specialDates = [],
  ariaDescribedby = null,
  value,
  onChange,
  onDateSelected,
  locale,
}) => {
  const internalDescId = useId();
  const descId = ariaDescribedby ?? `sol-calendar-desc-${internalDescId}`;

  // Controlled month navigation
  const [month, setMonth] = useState<Date>(() => {
    if (value instanceof Date) return value;
    if (value && 'start' in (value as DateRange)) return (value as DateRange).start ?? new Date();
    return new Date();
  });

  // Per-mode selection state
  const [singleDate, setSingleDate] = useState<Date | undefined>(
    value instanceof Date ? value : undefined
  );
  const [multiDates, setMultiDates] = useState<Date[]>(
    Array.isArray(value) && value[0] instanceof Date ? (value as Date[]) : []
  );
  const [rdpRange, setRdpRange] = useState<RDPDateRange | undefined>(() => {
    if (value && 'start' in (value as DateRange)) {
      const r = value as DateRange;
      return { from: r.start ?? undefined, to: r.end ?? undefined };
    }
    return undefined;
  });
  const [weekRdp, setWeekRdp] = useState<RDPDateRange | undefined>(undefined);
  const [multiWeeks, setMultiWeeks] = useState<DateRange[]>(
    Array.isArray(value) && value[0] && 'start' in (value[0] as DateRange) ? (value as DateRange[]) : []
  );

  // Sync value prop when it changes externally
  useEffect(() => {
    if (value === undefined) return;
    if (type === 'single-selection' && value instanceof Date) {
      setSingleDate(value);
      setMonth(value);
    } else if (type === 'multi-single-selection' && Array.isArray(value)) {
      setMultiDates(value as Date[]);
    } else if (type === 'range-selection' && value && 'start' in (value as DateRange)) {
      const r = value as DateRange;
      setRdpRange({ from: r.start ?? undefined, to: r.end ?? undefined });
      if (r.start) setMonth(r.start);
    } else if (type === 'week-selection' && value && 'start' in (value as DateRange)) {
      const r = value as DateRange;
      setWeekRdp({ from: r.start ?? undefined, to: r.end ?? undefined });
    } else if (type === 'multi-week-selection' && Array.isArray(value)) {
      setMultiWeeks(value as DateRange[]);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Disabled matcher — mirrors Angular's daysDisabled + min/max
  const disabledMatcher = useMemo<Matcher[]>(
    () => [
      ...(daysDisabled.length > 0 ? [{ dayOfWeek: daysDisabled } as Matcher] : []),
      ...(min ? [{ before: min } as Matcher] : []),
      ...(max ? [{ after: max } as Matcher] : []),
    ],
    [daysDisabled, min, max]
  );

  // Special-date modifiers
  const specialModifiers = useMemo(
    () => ({
      specialFull: specialDates.filter(s => s.status === 'full').map(s => s.date),
      specialPartial: specialDates.filter(s => s.status === 'partial').map(s => s.date),
    }),
    [specialDates]
  );

  const specialModifierClassNames: ModifiersClassNames = {
    specialFull: 'sol-special-full has-special-event',
    specialPartial: 'sol-special-partial has-special-event',
  };

  // Custom header — memoised to avoid re-creating on each render
  const CaptionComponent = useCallback(
    (props: CalendarHeaderProps) => <CalendarCaptionComponent {...props} locale={locale} />,
    [locale]
  );

  // Shared DayPicker props
  const commonProps = {
    month,
    onMonthChange: setMonth,
    disabled: disabledMatcher,
    showWeekNumber: displayWeeks,
    showOutsideDays: false,
    weekStartsOn: startingDay,
    ...(min ? { fromDate: min } : {}),
    ...(max ? { toDate: max } : {}),
    modifiers: specialModifiers,
    modifiersClassNames: specialModifierClassNames,
    components: { MonthCaption: CaptionComponent as typeof import('react-day-picker').MonthCaption },
    className: 'sol-rdp',
  } as const;

  // ── Selection handlers ──────────────────────────────────────────────────────

  const emit = useCallback(
    (v: CalendarValue) => {
      onChange?.(v);
      onDateSelected?.(v);
    },
    [onChange, onDateSelected]
  );

  const handleSingle = useCallback(
    (date: Date | undefined) => {
      setSingleDate(date);
      if (date) { setMonth(date); emit(date); }
    },
    [emit]
  );

  const handleMulti = useCallback(
    (dates: Date[] | undefined) => {
      const next = dates ?? [];
      setMultiDates(next);
      emit(next);
    },
    [emit]
  );

  const handleRange = useCallback(
    (range: RDPDateRange | undefined) => {
      setRdpRange(range);
      const dr: DateRange = { start: range?.from ?? null, end: range?.to ?? null };
      emit(dr);
    },
    [emit]
  );

  const handleWeekDayClick = useCallback(
    (day: Date) => {
      if (type === 'week-selection') {
        const { start, end } = getWeekRange(day, startingDay);
        setWeekRdp({ from: start, to: end });
        emit({ start, end });
      } else {
        // multi-week-selection
        const next = toggleWeek(multiWeeks, day, startingDay);
        setMultiWeeks(next);
        emit(next);
      }
    },
    [type, startingDay, multiWeeks, emit]
  );

  // ── Week modifiers ──────────────────────────────────────────────────────────

  const weekModifiers = useMemo(() => {
    if (type === 'week-selection' && weekRdp?.from && weekRdp?.to) {
      const start = weekRdp.from;
      const end = weekRdp.to;
      return {
        ...specialModifiers,
        weekStart: [start],
        weekEnd: [end],
        inWeek: (d: Date) => isInRange(d, { start, end }) && !isSameDay(d, start) && !isSameDay(d, end),
      };
    }
    if (type === 'multi-week-selection' && multiWeeks.length > 0) {
      const starts = multiWeeks.map(w => w.start!).filter(Boolean);
      const ends = multiWeeks.map(w => w.end!).filter(Boolean);
      return {
        ...specialModifiers,
        weekStart: starts,
        weekEnd: ends,
        inWeek: (d: Date) =>
          multiWeeks.some(
            w =>
              w.start &&
              w.end &&
              isInRange(d, { start: w.start, end: w.end }) &&
              !isSameDay(d, w.start) &&
              !isSameDay(d, w.end)
          ),
      };
    }
    return specialModifiers;
  }, [type, weekRdp, multiWeeks, specialModifiers]);

  const weekModifierClassNames: ModifiersClassNames = {
    weekStart: 'rdp-range_start sol-week-selected',
    weekEnd: 'rdp-range_end sol-week-selected',
    inWeek: 'rdp-range_middle sol-week-selected',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const calendarDescText = type === 'single-selection'
    ? 'Select a date'
    : type === 'multi-single-selection'
    ? 'Select multiple dates'
    : type === 'range-selection'
    ? 'Select a date range'
    : type === 'week-selection'
    ? 'Select a week'
    : 'Select multiple weeks';

  return (
    <div className="sol-calender">
      <span id={descId} className="sol-screenreader-only">{calendarDescText}</span>

      {type === 'single-selection' && (
        <DayPicker
          {...commonProps}
          mode="single"
          selected={singleDate}
          onSelect={handleSingle}
          aria-describedby={descId}
        />
      )}

      {type === 'multi-single-selection' && (
        <DayPicker
          {...commonProps}
          mode="multiple"
          selected={multiDates}
          onSelect={handleMulti}
          aria-describedby={descId}
        />
      )}

      {type === 'range-selection' && (
        <DayPicker
          {...commonProps}
          mode="range"
          selected={rdpRange}
          onSelect={handleRange}
          aria-describedby={descId}
        />
      )}

      {(type === 'week-selection' || type === 'multi-week-selection') && (
        <DayPicker
          {...commonProps}
          modifiers={weekModifiers as Record<string, Matcher | Matcher[]>}
          modifiersClassNames={{ ...specialModifierClassNames, ...weekModifierClassNames }}
          onDayClick={handleWeekDayClick}
          aria-describedby={descId}
        />
      )}
    </div>
  );
};
