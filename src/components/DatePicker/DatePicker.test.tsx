import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

// ── Helper to format a date to "MMM d, y" style (same as the default format helper in component) ──

function shortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

describe('DatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<DatePicker ariaLabel="Enter Date" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with a visible label', () => {
    render(<DatePicker label="Date:" />);
    expect(screen.getByText('Date:')).toBeInTheDocument();
  });

  it('displays the initial value in the input', () => {
    const date = new Date('January 4, 2023');
    render(<DatePicker value={date} ariaLabel="Enter Date" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/Jan/);
  });

  it('shows placeholder when no value', () => {
    render(<DatePicker placeholder="Select a date" ariaLabel="Enter Date" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toBe('Select a date');
  });

  it('disables the input when disabled=true', () => {
    render(<DatePicker disabled ariaLabel="Enter Date" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('makes the input readonly when readonly=true', () => {
    render(<DatePicker readonly ariaLabel="Enter Date" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('renders the calendar icon button when not disabled or readonly', () => {
    render(<DatePicker ariaLabel="Enter Date" />);
    expect(screen.getByLabelText('Open date picker')).toBeInTheDocument();
  });

  it('does not render a clickable calendar icon when disabled', () => {
    render(<DatePicker disabled ariaLabel="Enter Date" />);
    expect(screen.queryByLabelText('Open date picker')).not.toBeInTheDocument();
  });

  it('does not render a clickable calendar icon when readonly', () => {
    render(<DatePicker readonly ariaLabel="Enter Date" />);
    expect(screen.queryByLabelText('Open date picker')).not.toBeInTheDocument();
  });

  it('opens the popover when clicking the calendar icon', async () => {
    render(<DatePicker ariaLabel="Enter Date" />);
    const iconBtn = screen.getByLabelText('Open date picker');
    fireEvent.click(iconBtn);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows the Today button in the footer by default', async () => {
    render(<DatePicker ariaLabel="Enter Date" />);
    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  it('hides the Today button when displayFooter=false', async () => {
    render(<DatePicker ariaLabel="Enter Date" displayFooter={false} />);
    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => {
      expect(screen.queryByText('Today')).not.toBeInTheDocument();
    });
  });

  it('shows prev/next buttons by default (arrowPosition right)', () => {
    const date = new Date('January 15, 2023');
    render(<DatePicker value={date} prevNextButtons ariaLabel="Enter Date" />);
    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('hides prev/next buttons when prevNextButtons=false', () => {
    const date = new Date('January 15, 2023');
    render(<DatePicker value={date} prevNextButtons={false} ariaLabel="Enter Date" />);
    expect(screen.queryByLabelText('Previous day')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next day')).not.toBeInTheDocument();
  });

  it('calls onChange when clicking the next day button', () => {
    const date = new Date('January 15, 2023');
    const handleChange = vi.fn();
    render(<DatePicker value={date} prevNextButtons onChange={handleChange} ariaLabel="Enter Date" />);
    fireEvent.click(screen.getByLabelText('Next day'));
    expect(handleChange).toHaveBeenCalledOnce();
    const calledWith: Date = handleChange.mock.calls[0][0];
    expect(calledWith.getDate()).toBe(16);
  });

  it('calls onChange when clicking the previous day button', () => {
    const date = new Date('January 15, 2023');
    const handleChange = vi.fn();
    render(<DatePicker value={date} prevNextButtons onChange={handleChange} ariaLabel="Enter Date" />);
    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(handleChange).toHaveBeenCalledOnce();
    const calledWith: Date = handleChange.mock.calls[0][0];
    expect(calledWith.getDate()).toBe(14);
  });

  it('skips disabled days when navigating next', () => {
    // Friday Jan 13 → Monday Jan 16 (skip Sat=6 and Sun=0)
    const date = new Date(2023, 0, 13); // Friday
    const handleChange = vi.fn();
    render(
      <DatePicker
        value={date}
        prevNextButtons
        daysDisabled={[0, 6]}
        onChange={handleChange}
        ariaLabel="Enter Date"
      />
    );
    fireEvent.click(screen.getByLabelText('Next day'));
    const calledWith: Date = handleChange.mock.calls[0][0];
    expect(calledWith.getDate()).toBe(16); // Monday
  });

  it('skips disabled days when navigating previous', () => {
    // Monday Jan 16 → Friday Jan 13 (skip Sun=0 and Sat=6)
    const date = new Date(2023, 0, 16); // Monday
    const handleChange = vi.fn();
    render(
      <DatePicker
        value={date}
        prevNextButtons
        daysDisabled={[0, 6]}
        onChange={handleChange}
        ariaLabel="Enter Date"
      />
    );
    fireEvent.click(screen.getByLabelText('Previous day'));
    const calledWith: Date = handleChange.mock.calls[0][0];
    expect(calledWith.getDate()).toBe(13); // Friday
  });

  it('displays external error message', () => {
    render(<DatePicker ariaLabel="Enter Date" errorMessage="Please select a valid date" />);
    expect(screen.getByText('Please select a valid date')).toBeInTheDocument();
  });

  it('does not display error when disabled', () => {
    render(<DatePicker disabled ariaLabel="Enter Date" errorMessage="Error" />);
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('sets required attribute on input when required=true', () => {
    render(<DatePicker required ariaLabel="Enter Date" />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('calls onChange with null when input is cleared and blurred', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const date = new Date('January 15, 2023');
    const handleChange = vi.fn();
    render(<DatePicker value={date} onChange={handleChange} ariaLabel="Enter Date" />);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    fireEvent.blur(input);
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('shows internal error on blur with invalid text', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker ariaLabel="Enter Date" allowTextInput />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'not-a-date');
    fireEvent.blur(input);
    expect(screen.getByText('Not a valid date')).toBeInTheDocument();
  });

  it('shows required error when required field blurred with no value', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DatePicker required ariaLabel="Enter Date" />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('syncs value prop changes', async () => {
    const date1 = new Date('January 4, 2023');
    const date2 = new Date('February 10, 2023');
    const { rerender } = render(<DatePicker value={date1} ariaLabel="Enter Date" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/Jan/);
    rerender(<DatePicker value={date2} ariaLabel="Enter Date" />);
    await waitFor(() => {
      expect(input.value).toMatch(/Feb/);
    });
  });

  // ── Calendar interaction ──────────────────────────────────────────────────

  it('selects a date from the calendar and calls onChange', async () => {
    const handleChange = vi.fn();
    render(<DatePicker ariaLabel="Enter Date" onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    // react-day-picker renders day buttons whose text content is just the day number
    const dayButtons = screen.getAllByRole('button').filter(btn => {
      const text = btn.textContent?.trim();
      return text !== undefined && /^\d{1,2}$/.test(text) && btn.getAttribute('aria-disabled') !== 'true';
    });
    expect(dayButtons.length).toBeGreaterThan(0);
    fireEvent.click(dayButtons[0]);

    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('closes the calendar after a date is selected (no time picker)', async () => {
    render(<DatePicker ariaLabel="Enter Date" dateFormat="MMM d, y" />);

    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const dayButtons = screen.getAllByRole('button').filter(btn => {
      const text = btn.textContent?.trim();
      return text !== undefined && /^\d{1,2}$/.test(text) && btn.getAttribute('aria-disabled') !== 'true';
    });
    fireEvent.click(dayButtons[0]);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('keeps the calendar open after date selection when the time picker is visible', async () => {
    render(<DatePicker ariaLabel="Enter Date" dateFormat="MMM d, y, h:mm:ss a" />);

    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const dayButtons = screen.getAllByRole('button').filter(btn => {
      const text = btn.textContent?.trim();
      return text !== undefined && /^\d{1,2}$/.test(text) && btn.getAttribute('aria-disabled') !== 'true';
    });
    fireEvent.click(dayButtons[0]);

    // dialog must still be present — waiting for time selection before close
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('clicking a time option calls onChange with the combined date+time', async () => {
    const handleChange = vi.fn();
    const date = new Date('January 4, 2023');
    render(
      <DatePicker
        value={date}
        ariaLabel="Enter Date"
        dateFormat="MMM d, y, h:mm:ss a"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const timeOptions = screen.getAllByRole('option');
    expect(timeOptions.length).toBeGreaterThan(0);
    fireEvent.click(timeOptions[0]);

    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('closes the calendar on Escape key', async () => {
    render(<DatePicker ariaLabel="Enter Date" />);

    fireEvent.click(screen.getByLabelText('Open date picker'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ── Text-input range validation ───────────────────────────────────────────

  it('shows error when typed date is before minDate', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const minDate = new Date(2023, 0, 10);
    render(<DatePicker minDate={minDate} allowTextInput ariaLabel="Enter Date" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'January 5, 2023');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Not a valid date')).toBeInTheDocument();
    });
  });

  it('shows error when typed date is after maxDate', async () => {
    const maxDate = new Date(2023, 0, 20);
    render(<DatePicker maxDate={maxDate} allowTextInput ariaLabel="Enter Date" />);

    const input = screen.getByRole('textbox');
    // Use fireEvent.change for reliable controlled-input value setting
    fireEvent.change(input, { target: { value: 'January 25, 2023' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Not a valid date')).toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('suppresses aria-label when ariaLabelledby is provided', () => {
    render(<DatePicker ariaLabel="Enter Date" ariaLabelledby="my-label-id" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-label');
    expect(input).toHaveAttribute('aria-labelledby', 'my-label-id');
  });

  it('renders a screen-reader format hint matching the dateFormat prop', () => {
    render(<DatePicker ariaLabel="Enter Date" dateFormat="MM/dd/yyyy" />);
    expect(screen.getByText('Date format: MM/dd/yyyy')).toBeInTheDocument();
  });

  it('root element has data-testid="sol-date-picker"', () => {
    render(<DatePicker ariaLabel="Enter Date" />);
    expect(document.querySelector('[data-testid="sol-date-picker"]')).toBeInTheDocument();
  });
});
