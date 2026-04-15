import { Page } from '@playwright/test';

export class AutocompletePage {
  static DEFAULT_TIMEOUT = 2_000;
  inputText = '.sol-auto-complete input.sol-input';
  autocompletePanel = '.sol-autocomplete-panel';
  clearButton = 'button[aria-label="clear icon"]';
  autocompleteSpinner = 'div#spinner';

  constructor(private page: Page) {}

  async click(selector: string, force = false, _timeout = AutocompletePage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click({ force });
  }

  async isVisible(selector: string, timeout = AutocompletePage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible({ timeout });
  }

  async focus(selector: string, timeout = AutocompletePage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).focus({ timeout });
  }
}
