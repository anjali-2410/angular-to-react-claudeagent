import { Page } from '@playwright/test';

/**
 * Chip E2E page object — converted from chip.page.ts.
 * CSS selectors are identical to the Angular source.
 */
export class ChipPage {
  static DEFAULT_TIMEOUT = 2_000;

  chip = '.sol-chip';
  errorchip = 'div.basic.large.error';
  chipLabel = '.main-label';
  chipSublabel = '.sub-label';
  chipClosebtn = '.close-icon';
  chipLabelEdit = 'span.label-edit-mode';
  chipSublabelEdit = 'span.sub-label-edit-mode';
  tooltipBoxContent = 'div.tippy-content';

  constructor(private page: Page) {}

  async isVisible(selector: string, timeout = ChipPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible({ timeout });
  }

  async click(selector: string, _timeout = ChipPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click();
  }

  async isDisabled(selector: string, timeout = ChipPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible({ timeout });
  }
}
