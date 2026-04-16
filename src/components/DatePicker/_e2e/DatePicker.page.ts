import { Page } from '@playwright/test';

export class DatePickerPage {
  static DEFAULT_TIMEOUT = 2_000;
  id?: string;
  selector: string;
  previousIcon: string;
  nextIcon: string;
  inputText: string;
  calendarIcon: string;
  disabledCalendarIcon: string;
  errorMessage: string;
  calendarWrapper: string;
  timeOptionsSelector: string;
  timeInputSelector: string;

  constructor(
    private page: Page,
    private options?: { id?: string }
  ) {
    this.selector = '[data-testid="sol-date-picker"]';
    if (options && options.id) {
      this.selector = `#${options.id}`;
      this.id = options.id;
    }

    this.calendarIcon = `${this.selector} .sol-icon-button`;
    this.disabledCalendarIcon = `${this.selector} .input-wrapper .sol-icon`;
    this.inputText = `${this.selector} input.sol-input`;
    this.previousIcon = `${this.selector} .button-container button:first-child`;
    this.nextIcon = `${this.selector} .button-container button:last-child`;
    this.errorMessage = `${this.selector} .sol-error-message`;
    this.calendarWrapper = '.sol-datepicker-wrapper';
    this.timeOptionsSelector = '.time-option';
    this.timeInputSelector = '.sol-datepicker-wrapper .timepicker-input input';
  }

  toggleCalendar = async () => {
    if (await this.isCalendarOpen()) {
      return await this.closeCalendar();
    } else {
      return await this.openCalendar();
    }
  };

  isCalendarOpen = async () => {
    const openCalendarLocator = this.page.locator(this.calendarWrapper);
    return (await openCalendarLocator.count()) > 0;
  };

  openCalendar = async () => {
    if (!(await this.isCalendarOpen())) {
      return this.page.click(this.calendarIcon);
    }
  };

  closeCalendar = async () => {
    if (await this.isCalendarOpen()) {
      // Click outside to dismiss
      await this.page.keyboard.press('Escape');
    }
  };

  /**
   * Click a day by its number in the currently visible month.
   */
  pickDayOfMonth = async (day: number) => {
    await this.openCalendar();
    await this.page.click(
      `.sol-datepicker-wrapper .rdp-day button:not([disabled]):has-text(" ${day} ")`
    );
  };

  /**
   * Navigate to year/month and pick a day.
   */
  pickYearMonthDay = async (year: number, month: string, day: number) => {
    await this.openCalendar();
    // Navigate months until we reach the target month/year
    let attempts = 0;
    while (attempts < 24) {
      const headerText = await this.page.locator('.sol-calendar-header-label button').textContent();
      if (headerText && headerText.includes(month) && headerText.includes(String(year))) {
        break;
      }
      await this.page.click('.sol-calendar-header button[aria-label="Next month"]');
      attempts++;
    }
    await this.page.click(
      `.sol-datepicker-wrapper .rdp-day button:not([disabled]):has-text(" ${day} ")`
    );
  };

  getDate = async () => {
    return await this.page.inputValue(this.inputText);
  };

  /**
   * Set the text value of the date input.
   *
   * @param date - A string or Date object.
   * @param dateTimeFormatOptions - Intl.DateTimeFormat options object or ignored string.
   * @param locale - Locale string (default: 'en-US').
   */
  setDate = async (
    date: string | Date,
    dateTimeFormatOptions: any = '',
    locale = 'en-US'
  ) => {
    let dateText = '';

    if (typeof date === 'string') {
      dateText = date;
    } else if (dateTimeFormatOptions && typeof dateTimeFormatOptions !== 'string') {
      dateText = new Intl.DateTimeFormat(locale, dateTimeFormatOptions).format(date);
    } else if (date.getMinutes() || date.getHours() || date.getSeconds()) {
      dateText = new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    } else {
      dateText = new Intl.DateTimeFormat(locale).format(date);
    }

    await this.page.fill(this.inputText, dateText);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.down('Shift');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.up('Shift');
  };

  clearDateInput = async () => {
    return await this.page.fill(this.inputText, '');
  };

  goToNext = async () => {
    return await this.page.click(this.nextIcon);
  };

  goToPrev = async () => {
    return await this.page.click(this.previousIcon);
  };

  isDisabled = async () => {
    return await this.page.locator(this.inputText).isDisabled();
  };

  getSelector = () => {
    return this.selector;
  };

  clearInput = async () => {
    await this.clearDateInput();
  };

  /**
   * Pick a time from the time picker dropdown.
   */
  pickTime = async (timeString: string) => {
    await this.openCalendar();
    await this.page.fill(this.timeInputSelector, timeString);
    await this.page.click(`${this.timeOptionsSelector}:has-text("${timeString}")`);
  };

  isInputInvalid = async () => {
    return this.errorMessage && (await this.page.locator(this.errorMessage).isVisible());
  };

  /**
   * @deprecated Use getDate
   */
  getDateTime = async () => {
    return await this.getDate();
  };

  /**
   * @deprecated Use setDate
   */
  setDateTime = async (date: string | Date, dateTimeFormatOptions?: any, locale?: string) => {
    return await this.setDate(date, dateTimeFormatOptions, locale);
  };

  /**
   * @deprecated Use clearDateInput
   */
  clearDateTimeInput = async () => {
    return await this.clearDateInput();
  };
}
