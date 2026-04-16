import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DatePicker } from '../DatePicker';
import type { SpecialDates } from '../../Calendar/Calendar';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Date Picker/Examples',
  component: DatePicker,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: { control: 'date', description: 'Selected date value' },
    dateFormat: { control: 'text', description: 'Display format for the selected date' },
    timeFormat: { control: 'text', description: 'Time format for the time picker dropdown' },
    minDate: { control: 'date', description: 'Minimum selectable date' },
    maxDate: { control: 'date', description: 'Maximum selectable date' },
    daysDisabled: {
      control: 'object',
      description: 'Array of disabled days of the week (0=Sunday, 1=Monday, ...)',
    },
    specialDates: {
      control: 'object',
      description: "Array of special dates with status indicators ('full' | 'partial')",
    },
    disabled: { control: 'boolean', description: 'Disable the date picker' },
    readonly: { control: 'boolean', description: 'Make the date picker read-only' },
    allowTextInput: {
      control: 'boolean',
      description: 'Allow text input (when false, only calendar and arrows work)',
    },
    required: { control: 'boolean', description: 'Make the field required' },
    prevNextButtons: {
      control: 'boolean',
      description: 'Show previous/next day navigation buttons',
    },
    arrowPosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Position of the prev/next buttons',
    },
    allowAnyValidTime: {
      control: 'boolean',
      description: 'Allow users to enter any valid time value',
    },
    steps: { control: 'number', description: 'Time step increment in minutes' },
    displayFooter: {
      control: 'boolean',
      description: 'Show the Today footer button',
    },
    errorMessage: { control: 'text', description: 'Error message to display' },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// ── Controlled wrapper ────────────────────────────────────────────────────────

function ControlledDatePicker(props: React.ComponentProps<typeof DatePicker>) {
  const [date, setDate] = useState<Date | null>(props.value ?? null);
  const shortDateStyle: Intl.DateTimeFormatOptions = { dateStyle: 'short' };
  return (
    <div>
      <DatePicker {...props} value={date} onChange={setDate} />
      <br />
      <span style={{ fontFamily: 'var(--sol-typography-body-md-font-family)', fontSize: 'small' }}>
        Selected date:{' '}
        {date
          ? new Intl.DateTimeFormat('en-US', shortDateStyle).format(date)
          : '—'}
      </span>
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const BasicDatePicker: Story = {
  name: 'Basic Date Picker',
  render: args => <ControlledDatePicker {...args} />,
  args: {
    id: 'basic-date-picker',
    value: new Date('January 4, 2023'),
    dateFormat: 'MMM d, y',
    daysDisabled: [],
    allowTextInput: true,
    prevNextButtons: true,
    arrowPosition: 'right',
    ariaLabel: 'Enter Date',
    label: 'Date:',
    allowAnyValidTime: false,
    required: true,
  },
};

export const DatePickerWithTime: Story = {
  name: 'Date Picker with Time',
  render: args => <ControlledDatePicker {...args} />,
  args: {
    value: new Date('January 4, 2023 14:30:00'),
    dateFormat: 'MMM d, y, h:mm:ss a',
    daysDisabled: [],
    allowTextInput: true,
    prevNextButtons: true,
    arrowPosition: 'right',
    ariaLabel: 'Enter Date and Time',
    label: 'Date and Time:',
    timeFormat: 'hh:mm a',
    allowAnyValidTime: false,
    steps: 5,
  },
  argTypes: {
    allowAnyValidTime: {
      control: 'boolean',
      description: 'Allow users to enter any valid time value',
    },
    steps: { control: 'number', description: 'Time step increment in minutes' },
    timeFormat: { control: 'text', description: 'Time format pattern' },
  },
};

export const DatePickerWithConstraints: Story = {
  name: 'Date Picker with Constraints',
  render: args => <ControlledDatePicker {...args} />,
  args: {
    value: new Date('January 15, 2023'),
    dateFormat: 'MMM d, y',
    label: 'Date:',
    minDate: new Date(2023, 0, 4),
    maxDate: new Date(2023, 0, 29),
    daysDisabled: [1, 2],
    required: true,
    specialDates: [
      { date: new Date('January 4, 2023'), status: 'full' },
      { date: new Date('January 5, 2023'), status: 'partial' },
      { date: new Date('January 14, 2023'), status: 'full' },
      { date: new Date('January 15, 2023'), status: 'partial' },
      { date: new Date('January 24, 2023'), status: 'full' },
      { date: new Date('January 25, 2023'), status: 'partial' },
    ] satisfies SpecialDates[],
    allowTextInput: true,
    prevNextButtons: true,
    arrowPosition: 'right',
    ariaLabel: 'Enter Date',
    allowAnyValidTime: false,
  },
  argTypes: {
    minDate: { control: 'date', description: 'Minimum allowed date' },
    maxDate: { control: 'date', description: 'Maximum allowed date' },
    daysDisabled: {
      control: 'object',
      description: 'Array of disabled days of the week (0=Sunday, 1=Monday, ...)',
    },
    specialDates: {
      control: 'object',
      description: "Array of special dates with status indicators ('full' | 'partial')",
    },
  },
};

export const DatePickerWithStates: Story = {
  name: 'Date Picker States',
  render: ({ errorMessage, ...args }) => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div>
        <DatePicker
          {...args}
          value={date}
          onChange={setDate}
          errorMessage={!date ? errorMessage : undefined}
        />
        <br />
        <span style={{ fontFamily: 'var(--sol-typography-body-md-font-family)', fontSize: 'small' }}>
          Selected date:{' '}
          {date
            ? new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(date)
            : '—'}
        </span>
      </div>
    );
  },
  args: {
    id: 'date-picker-states',
    dateFormat: 'MMM d, y',
    prevNextButtons: true,
    arrowPosition: 'right',
    ariaLabel: 'Enter Date',
    label: 'Date:',
    errorMessage: 'Please select a valid date',
    disabled: false,
    readonly: false,
    allowTextInput: true,
  },
  argTypes: {
    errorMessage: { control: 'text', description: 'Error message to display' },
    disabled: { control: 'boolean', description: 'Disable the date picker' },
    readonly: { control: 'boolean', description: 'Make the date picker read-only' },
    allowTextInput: {
      control: 'boolean',
      description: 'Allow text input (when false, only calendar and arrows work)',
    },
    required: { control: 'boolean', description: 'Make the field required' },
  },
};
