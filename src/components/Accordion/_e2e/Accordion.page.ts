import { Page } from '@playwright/test';

/**
 * Accordion E2E page object.
 * Converted from accordion.page.ts — updated selectors from mat-* to sol-accordion-* class names.
 */
export class AccordionPage {
  accordionPanel: string;
  accordionPanelHeaderText: string;
  accordionPanelHeader: string;

  constructor(
    private page: Page,
    options?: { id?: string }
  ) {
    this.accordionPanel = options?.id
      ? `#${options.id} .sol-accordion-panel`
      : '.sol-accordion-panel';

    this.accordionPanelHeaderText = options?.id
      ? `#${options.id} .sol-accordion-panel-header .sol-accordion-panel-header-content span`
      : '.sol-accordion-panel-header .sol-accordion-panel-header-content span';

    this.accordionPanelHeader = options?.id
      ? `#${options.id} .sol-accordion-panel-header`
      : '.sol-accordion-panel-header';
  }

  async getTabCount() {
    return await this.page.locator(this.accordionPanel).count();
  }

  async getTabHeaderText(tabIndex: number) {
    return await this.page.locator(this.accordionPanelHeader).nth(tabIndex).innerText();
  }

  async isTabSelected(tabIndex: number) {
    const selected = await this.page
      .locator(this.accordionPanelHeader)
      .nth(tabIndex)
      .getAttribute('aria-expanded');
    return selected === 'true';
  }

  async isTabDisabled(tabIndex: number) {
    const disabled = await this.page
      .locator(this.accordionPanelHeader)
      .nth(tabIndex)
      .getAttribute('aria-disabled');
    return disabled === 'true';
  }

  async toggleTab(tabIndex: number) {
    return await this.page.locator(this.accordionPanelHeader).nth(tabIndex).click();
  }
}
