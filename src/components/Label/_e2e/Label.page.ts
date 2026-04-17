import { Page } from '@playwright/test';

export class LabelPage {
  readonly page: Page;
  readonly labelElement: string;
  readonly labelTextSelector: string;
  readonly requiredIndicatorSelector: string;
  readonly helpIconSelector: string;
  readonly helpTooltipSelector: string;

  constructor(page: Page) {
    this.page = page;
    this.labelElement = '.sol-label';
    this.labelTextSelector = '.sol-label .sol-label-text';
    this.requiredIndicatorSelector = '.sol-label .sol-label-asterisk';
    this.helpIconSelector = '.sol-label .sol-label-help-button';
    this.helpTooltipSelector = '.sol-label [role="tooltip"]';
  }

  async getLabelText(): Promise<string> {
    const labelLocator = this.page.locator(this.labelTextSelector).first();
    return (await labelLocator.innerText()) || '';
  }

  async isRequiredIndicatorVisible(): Promise<boolean> {
    const requiredIndicator = this.page.locator(this.requiredIndicatorSelector).first();
    return await requiredIndicator.isVisible().catch(() => false);
  }

  async isLabelDisabled(): Promise<boolean> {
    const labelElement = this.page.locator(this.labelElement);
    return await labelElement.evaluate((el) => el.classList.contains('disabled'));
  }

  async isLabelReadOnly(): Promise<boolean> {
    const labelElement = this.page.locator(this.labelElement);
    return await labelElement.evaluate((el) => el.classList.contains('readonly'));
  }

  async isHelpIconVisible(): Promise<boolean> {
    const helpIcon = this.page.locator(this.helpIconSelector).first();
    return await helpIcon.isVisible().catch(() => false);
  }

  async getHelpTooltipText(): Promise<string> {
    const helpIcon = this.page.locator(this.helpIconSelector).first();
    const isVisible = await helpIcon.isVisible().catch(() => false);
    if (isVisible) {
      await helpIcon.hover();
      await this.page.waitForTimeout(100);
    }
    const tooltip = this.page.locator(this.helpTooltipSelector).first();
    const isTooltipVisible = await tooltip.isVisible();
    if (isTooltipVisible) {
      const text = await tooltip.textContent();
      if (text?.trim()) return text.trim();
    }
    return '';
  }

  async clickHelpIcon(): Promise<void> {
    await this.page.locator(this.helpIconSelector).first().click();
  }

  async hoverHelpIcon(): Promise<void> {
    await this.page.locator(this.helpIconSelector).first().hover();
  }

  async isLabelVisible(): Promise<boolean> {
    return await this.page.locator(this.labelElement).isVisible();
  }
}
