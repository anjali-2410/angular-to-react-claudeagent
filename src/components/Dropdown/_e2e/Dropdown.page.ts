import { expect, Locator, Page } from '@playwright/test';

export interface DropdownPageOptions {
  id?: string;
  dropdownName?: string;
}

export class DropdownPage {
  static DEFAULT_TIMEOUT = 2_000;
  ANNOUNCEMENT_TIMEOUT = 2000;

  dropdownSelector: string;
  selector: string;
  dropdown: Locator;
  placeHolderBoxSelector: string;
  placeHolderBox: Locator;
  dropdownPanelSelector = '.sol-dropdown-options-panel';
  dropdownPanel: Locator;
  errorMessageSelector: string;
  errorMessage: Locator;
  searchBoxSelector: string;
  searchBox: Locator;
  footerSelector: string;
  footer: Locator;

  constructor(
    private page: Page,
    options?: DropdownPageOptions
  ) {
    this.dropdownSelector = 'sol-dropdown';
    this.dropdownSelector += options?.id ? `[id="${options.id}-container"]` : '';
    this.dropdownSelector += options?.dropdownName ? `[data-name="${options.dropdownName}"]` : '';
    this.selector = this.dropdownSelector;

    this.placeHolderBoxSelector = `${this.dropdownSelector} .sol-dropdown-trigger`;
    this.dropdown = page.locator(this.dropdownSelector);
    this.placeHolderBox = page.locator(this.placeHolderBoxSelector);
    this.dropdownPanel = page.locator(this.dropdownPanelSelector);

    this.errorMessageSelector = `${this.dropdownSelector} .sol-error-message`;
    this.errorMessage = page.locator(this.errorMessageSelector);

    this.searchBoxSelector = `${this.dropdownPanelSelector} .sol-dropdown-search`;
    this.searchBox = page.locator(this.searchBoxSelector);

    this.footerSelector = `${this.dropdownPanelSelector} .sol-select-footer`;
    this.footer = page.locator(this.footerSelector);
  }

  private async waitForDropdownClose() {
    await this.page.waitForSelector(this.dropdownPanelSelector, { state: 'detached' });
  }

  private async waitForDropdownOpen() {
    await this.page.waitForSelector(this.dropdownPanelSelector, { state: 'visible' });
  }

  async isOpen() {
    return await this.dropdownPanel.isVisible();
  }

  async toggle() {
    const open = await this.isOpen();
    if (open) {
      await this.page.keyboard.press('Escape');
      await this.waitForDropdownClose();
    } else {
      await this.placeHolderBox.click();
      await this.waitForDropdownOpen();
    }
  }

  async open() {
    if (!(await this.isOpen())) await this.toggle();
  }

  async close() {
    if (await this.isOpen()) await this.toggle();
  }

  async getPlaceholderText() {
    return (await this.placeHolderBox.locator('.placeholder-text').innerText()).trim();
  }

  async getDisplayText() {
    return (await this.placeHolderBox.locator('.display-text').innerText()).trim();
  }

  async expectDisplayToHaveText(text: string) {
    const actual = await this.placeHolderBox.locator('.display-text').innerText();
    return expect(actual.trim()).toBe(text);
  }

  getOptionById(id: string) {
    return this.dropdownPanel.locator(`[id="sol-option-${id}"]`);
  }

  getOptionByIndex(index: number) {
    return this.dropdownPanel.locator('[role="option"]').nth(index);
  }

  async getOptionTextById(id: string) {
    return (await this.getOptionById(id).locator('.sol-option-text').innerText()).trim();
  }

  async clickOptionById(id: string) {
    await this.getOptionById(id).click();
  }

  async clickOptionByIndex(index: number) {
    await this.getOptionByIndex(index).click();
  }

  async searchItem(query: string) {
    await this.open();
    await this.searchBox.fill(query);
  }

  async selectItem(label: string, delay?: number) {
    await this.open();
    const option = this.dropdownPanel.getByText(label, { exact: true });
    await option.scrollIntoViewIfNeeded();
    await option.click({ delay });
  }

  async deselectItem(label: string, delay?: number) {
    await this.open();
    const isSelected = await this.isItemSelected(label);
    if (isSelected) {
      await this.dropdownPanel.getByText(label, { exact: true }).click({ delay });
    }
  }

  async isItemSelected(label: string) {
    await this.open();
    return await this.dropdownPanel
      .locator(`.sol-option.option-selected`)
      .filter({ hasText: label })
      .isVisible();
  }

  async getErrorMessageText() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.innerText();
    }
    return '';
  }

  async isDisabledSet() {
    return await this.placeHolderBox.evaluate(
      (el) => el.getAttribute('tabindex') === '-1'
    );
  }

  getLiveRegion() {
    return this.page.locator(`${this.dropdownSelector} .sol-screenreader-only[aria-live="polite"]`);
  }

  async waitForAnnouncement(expectedText: string | RegExp): Promise<void> {
    const liveRegion = this.getLiveRegion();
    await expect(liveRegion).toContainText(expectedText, {
      timeout: this.ANNOUNCEMENT_TIMEOUT,
    });
  }

  async expectAriaExpandedState(isOpen: boolean) {
    await expect(this.placeHolderBox).toHaveAttribute('aria-expanded', isOpen.toString());
  }

  getSelector() {
    return this.dropdownSelector;
  }
}
