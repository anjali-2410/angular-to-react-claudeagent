/**
 * Calendar stories — converted from calendar.stories.ts
 * Stories: SingleSelection, WeekSelection, MultiSingleSelection, MultiWeekSelection, SpecialDates
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Calendar, type CalendarType, type CalendarValue, type DateRange, type SpecialDates as SpecialDatesItem } from '../Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar/Examples',
  component: Calendar,
  argTypes: {
    type: {
      control: 'select',
      options: ['single-selection', 'multi-single-selection', 'week-selection', 'multi-week-selection', 'range-selection'],
      description: 'Selection mode of the calendar',
    },
    startingDay: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'Starting day of the week (0=Sunday, 1=Monday, …)',
    },
    daysDisabled: {
      control: 'object',
      description: 'Array of disabled days (0=Sunday, 6=Saturday)',
    },
    min: { control: 'object', description: 'Minimum selectable date' },
    max: { control: 'object', description: 'Maximum selectable date' },
    specialDates: {
      control: 'object',
      description: 'Array of special dates with status (partial/full)',
    },
    displayWeeks: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// ── Controlled wrapper ─────────────────────────────────────────────────────

function CalendarStory({
  type,
  daysDisabled,
  min,
  max,
  startingDay,
  specialDates,
  displayWeeks,
  initial,
}: {
  type: CalendarType;
  daysDisabled?: number[];
  min?: Date | null;
  max?: Date | null;
  startingDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  specialDates?: SpecialDatesItem[];
  displayWeeks?: boolean;
  initial?: CalendarValue;
}) {
  const [value, setValue] = useState<CalendarValue | undefined>(initial);

  const handleChange = (v: CalendarValue) => {
    setValue(v);
    action('dateSelected')(v);
  };

  const display = () => {
    if (!value) return null;
    if (value instanceof Date) return <div>{value.toLocaleDateString()}</div>;
    if (Array.isArray(value) && value[0] instanceof Date)
      return (value as Date[]).map((d, i) => <div key={i}>{d.toLocaleDateString()}</div>);
    if (Array.isArray(value))
      return (value as DateRange[]).map((r, i) => (
        <div key={i}>{r.start?.toLocaleDateString()} – {r.end?.toLocaleDateString()}</div>
      ));
    if ('start' in (value as DateRange)) {
      const r = value as DateRange;
      return <div>{r.start?.toLocaleDateString()} – {r.end?.toLocaleDateString()}</div>;
    }
    return null;
  };

  return (
    <div style={{ width: 328, minHeight: 384 }}>
      <Calendar
        type={type}
        daysDisabled={daysDisabled}
        min={min}
        max={max}
        startingDay={startingDay}
        specialDates={specialDates}
        displayWeeks={displayWeeks}
        value={value}
        onChange={handleChange}
      />
      {display()}
    </div>
  );
}

// ── Stories ────────────────────────────────────────────────────────────────

export const SingleSelection: Story = {
  name: 'SingleSelection',
  args: {
    type: 'single-selection',
    daysDisabled: [0, 6],
    startingDay: 0,
    specialDates: [],
  },
  render: args => (
    <CalendarStory
      type={args.type as CalendarType}
      daysDisabled={args.daysDisabled}
      min={args.min ?? null}
      max={args.max ?? null}
      startingDay={args.startingDay as 0}
      specialDates={args.specialDates}
      initial={new Date(2022, 11, 4)}
    />
  ),
};

export const WeekSelection: Story = {
  name: 'WeekSelection',
  args: {
    type: 'week-selection',
    daysDisabled: [],
    startingDay: 0,
  },
  parameters: {
    controls: {
      include: ['type', 'daysDisabled', 'min', 'max'],
    },
  },
  render: args => (
    <CalendarStory
      type={args.type as CalendarType}
      daysDisabled={args.daysDisabled}
      min={args.min ?? null}
      max={args.max ?? null}
      initial={{ start: new Date(2022, 11, 4), end: new Date(2022, 11, 10) }}
    />
  ),
};

export const MultiSingleSelection: Story = {
  name: 'MultiSingleSelection',
  args: { type: 'multi-single-selection', daysDisabled: [], startingDay: 0 },
  parameters: { controls: { disable: true }, actions: { disable: true } },
  tags: ['hidden', 'docs-only'],
  render: () => <CalendarStory type="multi-single-selection" initial={[]} />,
};

export const MultiWeekSelection: Story = {
  name: 'MultiWeekSelection',
  args: { type: 'multi-week-selection', daysDisabled: [], startingDay: 0 },
  parameters: { controls: { disable: true }, actions: { disable: true } },
  tags: ['hidden', 'docs-only'],
  render: () => <CalendarStory type="multi-week-selection" initial={[]} />,
};

export const SpecialDates: Story = {
  name: 'SpecialDates',
  args: { type: 'single-selection', daysDisabled: [], startingDay: 0 },
  parameters: { controls: { disable: true }, actions: { disable: true } },
  tags: ['hidden', 'docs-only'],
  render: () => (
    <CalendarStory
      type="single-selection"
      specialDates={[
        { date: new Date(2022, 11, 3), status: 'partial' },
        { date: new Date(2022, 11, 4), status: 'full' },
        { date: new Date(2022, 11, 13), status: 'full' },
        { date: new Date(2022, 11, 14), status: 'partial' },
        { date: new Date(2022, 11, 23), status: 'partial' },
        { date: new Date(2022, 11, 24), status: 'full' },
      ]}
      initial={new Date(2022, 11, 4)}
    />
  ),
};
