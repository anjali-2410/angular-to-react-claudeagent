import { Page } from '@playwright/test';

/**
 * Card E2E page object — converted from card.page.ts.
 * CSS selectors are identical to the Angular source.
 */
export class CardPage {
  static DEFAULT_TIMEOUT = 2_000;

  card = '.sol-card';
  cardBody = '.sol-card-body';
  cardFooter = '.sol-card-footer';
  cardWithHoverEnabled = '.sol-card.hoverable';
  cardWithAlternativeBackgroundEnabled = '.sol-card.use-alternate-background-color';
  cardWithBody = '.sol-card .sol-card-body';
  cardWithFooter = '.sol-card .sol-card-footer';

  constructor(private page: Page) {}

  async isVisible(selector: string, _timeout = CardPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }
}
