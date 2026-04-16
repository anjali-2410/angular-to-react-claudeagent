/**
 * CalendarRange stories — converted from calendarRangeSelection.stories.ts
 * Story: RangeSelection
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Calendar, type DateRange } from '../Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar/Examples',
  component: Calendar,
  argTypes: {
    daysDisabled: { control: 'object', description: 'Array of disabled days (0=Sunday, 6=Saturday)' },
    min: { control: 'date', description: 'Minimum selectable date' },
    max: { control: 'date', description: 'Maximum selectable date' },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const RangeSelection: Story = {
  name: 'RangeSelection',
  args: {
    type: 'range-selection',
    daysDisabled: [0, 6],
    min: undefined,
    max: undefined,
  },
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);

    const handleChange = (v: unknown) => {
      setValue(v as DateRange);
      action('dateSelected')(v);
    };

    return (
      <main>
        <h1 className="sol-screenreader-only">Range selection</h1>
        <div style={{ width: 328, minHeight: 384 }}>
          <Calendar
            type="range-selection"
            daysDisabled={args.daysDisabled}
            min={args.min instanceof Date ? args.min : null}
            max={args.max instanceof Date ? args.max : null}
            onChange={handleChange}
          />
          {value?.start && value?.end && (
            <div>
              {value.start.toLocaleDateString()} – {value.end.toLocaleDateString()}
            </div>
          )}
        </div>
      </main>
    );
  },
};
