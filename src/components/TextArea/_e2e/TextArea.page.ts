import { Page } from '@playwright/test';

export class TextAreaPage {
  static DEFAULT_TIMEOUT = 2_000;
  textareaid = 'textarea.sol-input';
  textlabel = '.sol-text-area';
  templatemsgreqid = '.sol-error-message';
  infoMessage = '.sol-info-message';
  characterCounter = '.sol-text-counter-text';

  constructor(private page: Page) {}

  async click(selector: string, _timeout = TextAreaPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click();
  }

  async isVisible(selector: string, timeout = TextAreaPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible({ timeout });
  }

  async isDisabled(selector: string, timeout = TextAreaPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isDisabled({ timeout });
  }
}
