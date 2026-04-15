import { Page } from '@playwright/test';

/**
 * ActionBar E2E page object.
 * Converted from action-bar.page.ts
 * Updated selectors: sol-button element → .sol-button CSS class (React renders class not custom element)
 */
export class ActionbarPage {
  static DEFAULT_TIMEOUT = 2_000;

  private readonly root = '.sol-action-bar';

  actionbarText: string;
  actionbarButton: string;
  actionbarButtonText: string;
  actionbarButtonIcon: string;

  constructor(private page: Page) {
    this.actionbarText = `${this.root} span.bar-label`;
    this.actionbarButton = `${this.root} .sol-button`;
    this.actionbarButtonText = `${this.root} .sol-button span.projected-content`;
    this.actionbarButtonIcon = `${this.root} .sol-button svg`;
  }

  async isVisible(selector: string, timeout = ActionbarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible({ timeout });
  }

  async click(selector: string, timeout = ActionbarPage.DEFAULT_TIMEOUT): Promise<void> {
    return await this.page.locator(selector).click({ timeout });
  }

  async isDisabled(selector: string, timeout = ActionbarPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isDisabled({ timeout });
  }
}
