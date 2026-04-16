import { Page } from '@playwright/test';

/**
 * Calendar E2E page object.
 * Converted from calendar.page.ts.
 *
 * Selector changes vs Angular source:
 *   mat-calendar-content      → .rdp-month_grid  (react-day-picker)
 *   sol-calendar-header sol-button → .sol-calendar-header .sol-button button
 *   mat-calendar-body-cell-container → .rdp-day  (react-day-picker cell)
 *   .mat-calendar-table-header span → .rdp-weekday
 */
export class CalendarPage {
  static DEFAULT_TIMEOUT = 2_000;

  // ── Selectors ────────────────────────────────────────────────────────────

  calendarContent = '.rdp-month_grid';
  calendarPreviousButton = '.sol-calendar-header .sol-button:first-of-type button';
  calendarNextButton = '.sol-calendar-header .sol-button:last-of-type button';
  calendarHeaderMonth = '.sol-calendar-header .sol-calendar-header-label button';
  calendarWeekdayHeader = '.sol-calender .rdp-weekday';

  // Day buttons — react-day-picker renders buttons inside each day cell
  calendarSpecficDateOne = 'button[aria-label*="February 2, 2017"]';
  calendarSpecificDateTwo = 'button[aria-label*="February 10, 2017"]';
  calendarSpecificDateThree = 'button[aria-label*="February 13, 2017"]';

  disabledDateOne = 'button[aria-label*="Tuesday, February 7, 2017"]';
  disabledDateTwo = 'button[aria-label*="Wednesday, February 15, 2017"]';

  minDisableDate = 'button[aria-label*="Monday, December 5, 2022"]';
  minDisableBeforeDate = 'button[aria-label*="Saturday, December 3, 2022"]';
  maxDisableDate = 'button[aria-label*="Friday, December 30, 2022"]';
  maxDisableAfterDate = 'button[aria-label*="Saturday, December 31, 2022"]';

  calendarMinMaxSelectDateOne = 'button[aria-label*="Thursday, December 8, 2022"]';
  calendarMinMaxSelectDateTwo = 'button[aria-label*="Thursday, December 15, 2022"]';

  rangeLeftDate = 'button[aria-label*="Monday, February 6, 2017"]';
  rangeRightDate = 'button[aria-label*="Thursday, February 9, 2017"]';
  rangeDisabledDateOne = 'button[aria-label*="Tuesday, February 7, 2017"]';
  rangeDisabledDateTwo = 'button[aria-label*="Wednesday, February 8, 2017"]';

  specialDateOne = 'button[aria-label*="December 4, 2022"]';
  specialDateTwo = 'button[aria-label*="December 5, 2022"]';
  specialDateIcon = '.has-special-event:first-of-type .rdp-day_button::after';

  // Selected/range classes from react-day-picker
  selectedDay = '.rdp-selected .rdp-day_button';
  rangeStartDay = '.rdp-range_start .rdp-day_button';
  rangeEndDay = '.rdp-range_end .rdp-day_button';
  rangeMiddleDay = '.rdp-range_middle .rdp-day_button';
  weekSelectedDay = '.sol-week-selected .rdp-day_button';
  disabledDay = '.rdp-disabled .rdp-day_button';
  todayDay = '.rdp-today .rdp-day_button';

  constructor(private page: Page) {}

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async click(selector: string, _timeout = CalendarPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click();
  }

  async isVisible(selector: string, _timeout = CalendarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async isDisabled(selector: string, _timeout = CalendarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isDisabled();
  }

  async isEnabled(selector: string, _timeout = CalendarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  async isSelected(selector: string, _timeout = CalendarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async prevMonth(): Promise<void> {
    await this.click(this.calendarPreviousButton);
    await this.page.waitForTimeout(300);
  }

  async nextMonth(): Promise<void> {
    await this.click(this.calendarNextButton);
    await this.page.waitForTimeout(300);
  }

  async changeMonth(): Promise<void> {
    await this.click(this.calendarHeaderMonth);
    await this.page.waitForTimeout(300);
  }

  async selectDate(): Promise<void> {
    await this.click(this.calendarSpecficDateOne);
    await this.page.waitForTimeout(300);
    await this.click(this.calendarSpecificDateTwo);
    await this.page.waitForTimeout(300);
    await this.click(this.calendarSpecificDateThree);
    await this.page.waitForTimeout(300);
  }

  async selectMinMaxDate(): Promise<void> {
    await this.click(this.calendarMinMaxSelectDateOne);
    await this.page.waitForTimeout(300);
    await this.click(this.calendarMinMaxSelectDateTwo);
    await this.page.waitForTimeout(300);
  }

  async selectWeek(): Promise<void> {
    await this.click(this.calendarSpecficDateOne);
    await this.page.waitForTimeout(300);
  }
}
