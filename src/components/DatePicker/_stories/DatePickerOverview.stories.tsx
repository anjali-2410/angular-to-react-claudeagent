/**
 * DatePicker overview stories — docs-only examples embedded in DatePicker.mdx.
 * Hidden from the Storybook sidebar (tags: ['hidden', 'docs-only']).
 */
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DatePicker } from '../DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Date Picker/OverviewExamples',
  component: DatePicker,
  tags: ['hidden', 'docs-only'],
  parameters: { controls: { disable: true },
    actions: { disable: true },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// ── Basic date picker ─────────────────────────────────────────────────────────

export const BasicDatePicker: Story = {
  name: 'BasicDatePicker',
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date('January 4, 2023'));
    return (
      <DatePicker
        id="overview-basic"
        label="Date:"
        ariaLabel="Enter Date"
        value={date}
        onChange={setDate}
        dateFormat="MMM d, y"
        prevNextButtons
        arrowPosition="right"
        allowTextInput
      />
    );
  },
};

// ── Date picker with time ─────────────────────────────────────────────────────

export const DatePickerWithTime: Story = {
  name: 'DatePickerWithTime',
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date('January 4, 2023 14:30:00'));
    return (
      <DatePicker
        id="overview-with-time"
        label="Date and Time:"
        ariaLabel="Enter Date and Time"
        value={date}
        onChange={setDate}
        dateFormat="MMM d, y, h:mm:ss a"
        timeFormat="hh:mm a"
        steps={15}
        prevNextButtons
        arrowPosition="right"
        allowTextInput
      />
    );
  },
};

// ── Disabled state ────────────────────────────────────────────────────────────

export const DatePickerDisabled: Story = {
  name: 'DatePickerDisabled',
  render: () => (
    <DatePicker
      id="overview-disabled"
      label="Date:"
      ariaLabel="Enter Date"
      value={new Date('January 4, 2023')}
      disabled
    />
  ),
};

// ── Read-only state ───────────────────────────────────────────────────────────

export const DatePickerReadonly: Story = {
  name: 'DatePickerReadonly',
  render: () => (
    <DatePicker
      id="overview-readonly"
      label="Date:"
      ariaLabel="Enter Date"
      value={new Date('January 4, 2023')}
      readonly
    />
  ),
};

// ── Error state ───────────────────────────────────────────────────────────────

export const DatePickerWithError: Story = {
  name: 'DatePickerWithError',
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <DatePicker
        id="overview-error"
        label="Date:"
        ariaLabel="Enter Date"
        value={date}
        onChange={setDate}
        errorMessage={!date ? 'Please select a valid date' : undefined}
        required
      />
    );
  },
};
