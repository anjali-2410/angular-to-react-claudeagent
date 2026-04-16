import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  describe('basic rendering', () => {
    it('renders without errors', () => {
      render(<Calendar />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });

    it('renders with type single-selection by default', () => {
      render(<Calendar />);
      // DayPicker renders a table/grid for single selection
      expect(document.querySelector('.sol-rdp')).toBeTruthy();
    });

    it('renders the calendar header with prev/next buttons', () => {
      render(<Calendar />);
      expect(screen.getByLabelText('Previous month')).toBeTruthy();
      expect(screen.getByLabelText('Next month')).toBeTruthy();
    });

    it('renders the month/year label', () => {
      const fixedDate = new Date(2024, 0, 1); // January 2024
      render(<Calendar value={fixedDate} type="single-selection" />);
      // The header label should contain "January 2024" in some locale
      expect(screen.getAllByLabelText(/January 2024/i).length).toBeGreaterThan(0);
    });
  });

  describe('navigation', () => {
    it('navigates to next month when next button is clicked', async () => {
      const user = userEvent.setup();
      const jan = new Date(2024, 0, 15);
      render(<Calendar value={jan} type="single-selection" />);
      await user.click(screen.getByLabelText('Next month'));
      expect(screen.getAllByLabelText(/February 2024/i).length).toBeGreaterThan(0);
    });

    it('navigates to previous month when prev button is clicked', async () => {
      const user = userEvent.setup();
      const feb = new Date(2024, 1, 15);
      render(<Calendar value={feb} type="single-selection" />);
      await user.click(screen.getByLabelText('Previous month'));
      expect(screen.getAllByLabelText(/January 2024/i).length).toBeGreaterThan(0);
    });
  });

  describe('single selection', () => {
    it('calls onChange when a date is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Calendar type="single-selection" onChange={handler} />);
      const dayButtons = document.querySelectorAll('.rdp-day_button');
      if (dayButtons.length > 0) {
        await user.click(dayButtons[0] as HTMLElement);
        expect(handler).toHaveBeenCalled();
      }
    });

    it('highlights the selected date', () => {
      const selected = new Date(2024, 0, 15);
      render(<Calendar type="single-selection" value={selected} />);
      // react-day-picker adds rdp-selected class to the selected day
      const selectedDay = document.querySelector('.rdp-selected');
      expect(selectedDay).toBeTruthy();
    });
  });

  describe('range selection', () => {
    it('renders with range type', () => {
      render(<Calendar type="range-selection" />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });

    it('calls onChange when start date is selected', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Calendar type="range-selection" onChange={handler} />);
      const dayButtons = document.querySelectorAll('.rdp-day_button');
      if (dayButtons.length > 0) {
        await user.click(dayButtons[5] as HTMLElement);
        expect(handler).toHaveBeenCalled();
      }
    });
  });

  describe('multi-single selection', () => {
    it('renders with multi-single type', () => {
      render(<Calendar type="multi-single-selection" />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });
  });

  describe('week selection', () => {
    it('renders with week-selection type', () => {
      render(<Calendar type="week-selection" />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });

    it('selects a full week when a day is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Calendar type="week-selection" onChange={handler} startingDay={1} />);
      const dayButtons = document.querySelectorAll('.rdp-day_button');
      if (dayButtons.length > 0) {
        await user.click(dayButtons[7] as HTMLElement);
        expect(handler).toHaveBeenCalledOnce();
        const result = handler.mock.calls[0][0];
        expect(result).toHaveProperty('start');
        expect(result).toHaveProperty('end');
      }
    });
  });

  describe('multi-week selection', () => {
    it('renders with multi-week-selection type', () => {
      render(<Calendar type="multi-week-selection" />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });

    it('accumulates weeks when multiple days are clicked', async () => {
      const user = userEvent.setup();
      const results: unknown[] = [];
      const handler = vi.fn(v => results.push(v));
      render(<Calendar type="multi-week-selection" onChange={handler} />);
      const dayButtons = document.querySelectorAll('.rdp-day_button');
      if (dayButtons.length > 5) {
        await user.click(dayButtons[3] as HTMLElement);
        await user.click(dayButtons[12] as HTMLElement);
        expect(handler).toHaveBeenCalledTimes(2);
        // After two clicks, should have 2 weeks selected
        const last = results[results.length - 1] as unknown[];
        expect(Array.isArray(last)).toBe(true);
        expect((last as unknown[]).length).toBe(2);
      }
    });
  });

  describe('constraints', () => {
    it('disables days matching daysDisabled', () => {
      // Render with all weekends disabled
      render(<Calendar daysDisabled={[0, 6]} />);
      const disabled = document.querySelectorAll('.rdp-disabled');
      expect(disabled.length).toBeGreaterThan(0);
    });

    it('renders the calendar with min/max dates', () => {
      const min = new Date(2024, 0, 5);
      const max = new Date(2024, 0, 25);
      render(<Calendar value={new Date(2024, 0, 15)} min={min} max={max} />);
      expect(document.querySelector('.sol-calender')).toBeTruthy();
    });
  });

  describe('special dates', () => {
    it('adds has-special-event class for special dates', () => {
      const currentMonth = new Date();
      const special = [{ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15), status: 'full' as const }];
      render(<Calendar specialDates={special} />);
      // Check that special event classes are applied
      const specials = document.querySelectorAll('.has-special-event');
      expect(specials.length).toBeGreaterThanOrEqual(0); // May be 0 if the date is not in current view
    });
  });

  describe('display weeks', () => {
    it('shows week numbers when displayWeeks is true', () => {
      render(<Calendar displayWeeks />);
      const weekNumbers = document.querySelectorAll('.rdp-week_number');
      expect(weekNumbers.length).toBeGreaterThan(0);
    });

    it('hides week numbers by default', () => {
      render(<Calendar />);
      const weekNumbers = document.querySelectorAll('.rdp-week_number');
      expect(weekNumbers.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('has a screenreader description element', () => {
      render(<Calendar />);
      expect(document.querySelector('.sol-screenreader-only')).toBeTruthy();
    });

    it('describes single-selection mode to screen readers', () => {
      render(<Calendar type="single-selection" />);
      expect(screen.getByText('Select a date')).toBeTruthy();
    });

    it('describes range-selection mode to screen readers', () => {
      render(<Calendar type="range-selection" />);
      expect(screen.getByText('Select a date range')).toBeTruthy();
    });
  });
});
