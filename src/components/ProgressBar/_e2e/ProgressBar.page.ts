import { Page } from '@playwright/test';

export class ProgressBarPage {
  static DEFAULT_TIMEOUT = 2_000;
  determinateProgressBar = 'div.sol-progress-bar-determinate';
  determinateProgressBarFill = 'div.sol-progress-bar-fill';
  multiProgressBarOne = '.sol-progress-bar-wrapper > div > div:nth-child(1) .sol-progress-bar-determinate';
  multiProgressBarOneFill = '.sol-progress-bar-wrapper > div > div:nth-child(1) .sol-progress-bar-fill';
  multiProgressBarTwo = '.sol-progress-bar-wrapper > div > div:nth-child(2) .sol-progress-bar-determinate';
  multiProgressBarTwoFill = '.sol-progress-bar-wrapper > div > div:nth-child(2) .sol-progress-bar-fill';

  constructor(private page: Page) {}

  async isVisible(selector: string, _timeout = ProgressBarPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click();
  }
}
