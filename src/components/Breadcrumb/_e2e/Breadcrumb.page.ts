import { Page } from '@playwright/test';

/**
 * Breadcrumb E2E page object.
 * Converted from breadcrumb.page.ts.
 *
 * Selector changes vs Angular source:
 *   sol-button[aria-label="…"] → button[aria-label="…"]  (React renders <button> not custom element)
 *   sol-menu                   → .sol-breadcrumb-dropdown  (React custom dropdown)
 *   .sol-menu-item             → .sol-breadcrumb-dropdown-item button
 *   .cdk-overlay-pane          → .sol-breadcrumb-dropdown
 *   sol-tooltip, .tippy-box    → .tippy-box  (tippy.js — unchanged)
 */
export class BreadcrumbPage {
  constructor(private page: Page) {}

  // ── Selectors ────────────────────────────────────────────────────────────

  readonly breadcrumbNav = '.sol-breadcrumb';
  readonly breadcrumbList = '.sol-breadcrumb-list';
  readonly breadcrumbItems = '.sol-breadcrumb-item';
  readonly breadcrumbLinks = '.sol-breadcrumb-link';
  readonly breadcrumbText = '.sol-breadcrumb-text';
  readonly lastBreadcrumbItem = '.sol-breadcrumb-item-last';
  readonly lastBreadcrumbText = '.sol-breadcrumb-text-last';
  readonly secondToLastItem = '.sol-breadcrumb-item-second-to-last';
  readonly menuButton = 'button[aria-label="Show more breadcrumb items"]';
  readonly menuItem = '.sol-breadcrumb-item-menu';
  readonly dropdown = '.sol-breadcrumb-dropdown';
  readonly dropdownItems = '.sol-breadcrumb-dropdown-item button';
  readonly separators = '.sol-breadcrumb-separator';
  readonly truncatedLink = '.sol-breadcrumb-link-truncated';
  readonly truncatedText = '.sol-breadcrumb-text-truncated';
  readonly ariaCurrentPage = '[aria-current="page"]';
  readonly menuButtonInContainer = '.sol-breadcrumb-item-menu button[aria-label="Show more breadcrumb items"]';
  readonly tippyBox = '.tippy-box';

  // Storybook scenario selectors
  readonly fiveItemBreadcrumb = 'nav[aria-label="Five items breadcrumb with truncation"]';
  readonly breadcrumbWithTooltip = 'nav[aria-label="Breadcrumb with long item and tooltip"]';
  readonly singleItemBreadcrumb = 'nav[aria-label="Single item breadcrumb"]';
  readonly twoItemsBreadcrumb = 'nav[aria-label="Two items breadcrumb"]';
  readonly threeItemsBreadcrumb = 'nav[aria-label="Three items breadcrumb"]';
  readonly fourItemsBreadcrumb = 'nav[aria-label="Four items breadcrumb"]';

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getBreadcrumbNav() { return this.page.locator(this.breadcrumbNav); }
  getBreadcrumbItems() { return this.page.locator(this.breadcrumbItems); }
  getBreadcrumbLinks() { return this.page.locator(this.breadcrumbLinks); }
  getLastBreadcrumbItem() { return this.page.locator(this.lastBreadcrumbItem); }
  getSecondToLastItem() { return this.page.locator(this.secondToLastItem); }
  getMenuButton() { return this.page.locator(this.menuButton); }
  getDropdownItems() { return this.page.locator(this.dropdownItems); }
  getSeparators() { return this.page.locator(this.separators); }

  // ── Actions ───────────────────────────────────────────────────────────────

  async clickBreadcrumbLink(index: number): Promise<void> {
    await this.page.locator(this.breadcrumbLinks).nth(index).click();
  }

  async clickMenuButton(): Promise<void> {
    await this.page.locator(this.menuButton).click();
  }

  async clickDropdownItem(index: number): Promise<void> {
    await this.page.locator(this.dropdownItems).nth(index).click();
  }

  async focusBreadcrumbLink(index: number): Promise<void> {
    await this.page.locator(this.breadcrumbLinks).nth(index).focus();
  }

  async pressEnterOnBreadcrumbLink(index: number): Promise<void> {
    await this.page.locator(this.breadcrumbLinks).nth(index).press('Enter');
  }

  async pressSpaceOnBreadcrumbLink(index: number): Promise<void> {
    await this.page.locator(this.breadcrumbLinks).nth(index).press(' ');
  }

  async pressTabFromBreadcrumb(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async pressShiftTabFromBreadcrumb(): Promise<void> {
    await this.page.keyboard.press('Shift+Tab');
  }

  // ── Validation ────────────────────────────────────────────────────────────

  async isMenuButtonVisible(): Promise<boolean> {
    return await this.page.locator(this.menuButton).isVisible();
  }

  async isDropdownOpen(): Promise<boolean> {
    return await this.page.locator(this.dropdown).isVisible();
  }

  async getAriaLabel(): Promise<string | null> {
    return await this.page.locator(this.breadcrumbNav).first().getAttribute('aria-label');
  }

  async isLastItemAriaHidden(): Promise<boolean> {
    const attr = await this.page.locator(this.lastBreadcrumbText).first().getAttribute('aria-hidden');
    return attr === 'true';
  }

  async areSeparatorsAriaHidden(): Promise<boolean> {
    const separators = await this.page.locator(this.separators).all();
    const checks = await Promise.all(separators.map(s => s.getAttribute('aria-hidden')));
    return checks.every(a => a === 'true');
  }

  async getBreadcrumbItemCount(): Promise<number> {
    return await this.page.locator(this.breadcrumbItems).count();
  }

  async getBreadcrumbLinkCount(): Promise<number> {
    return await this.page.locator(this.breadcrumbLinks).count();
  }

  async getDropdownItemCount(): Promise<number> {
    return await this.page.locator(this.dropdownItems).count();
  }

  async getBreadcrumbText(index: number): Promise<string> {
    return await this.page.locator(this.breadcrumbLinks).nth(index).innerText();
  }

  async getLastBreadcrumbText(): Promise<string> {
    return await this.page.locator(this.lastBreadcrumbItem).locator(this.lastBreadcrumbText).innerText();
  }

  async hoverOverLastItem(): Promise<void> {
    await this.page.locator(this.lastBreadcrumbItem).locator(this.lastBreadcrumbText).hover();
  }

  async hoverOverSecondToLastItem(): Promise<void> {
    await this.page.locator(this.secondToLastItem).locator(this.breadcrumbLinks).hover();
  }

  async isTooltipVisible(): Promise<boolean> {
    await this.page.waitForTimeout(300);
    return await this.page.locator(this.tippyBox).isVisible();
  }

  async getTooltipText(): Promise<string> {
    return await this.page.locator(`${this.tippyBox} .tippy-content`).first().innerText();
  }

  async waitForBreadcrumb(): Promise<void> {
    await this.page.waitForSelector(this.breadcrumbNav);
  }

  async isLastItemTruncated(): Promise<boolean> {
    const className = await this.page.locator(this.lastBreadcrumbItem).locator(this.lastBreadcrumbText).getAttribute('class');
    return className?.includes('sol-breadcrumb-text-truncated') ?? false;
  }

  async isSecondToLastTruncated(): Promise<boolean> {
    const className = await this.page.locator(this.secondToLastItem).locator(this.breadcrumbLinks).getAttribute('class');
    return className?.includes('sol-breadcrumb-link-truncated') ?? false;
  }

  async isMenuItemVisible(): Promise<boolean> {
    try { return await this.page.locator(this.menuItem).isVisible(); } catch { return false; }
  }

  async isLastItemVisible(): Promise<boolean> {
    try { return await this.page.locator(this.lastBreadcrumbItem).isVisible(); } catch { return false; }
  }

  async isFirstItemVisible(): Promise<boolean> {
    try { return await this.page.locator(this.breadcrumbItems).first().isVisible(); } catch { return false; }
  }

  async getBreadcrumbLabels(): Promise<string[]> {
    const items = await this.page.locator(this.breadcrumbItems).all();
    const labels: string[] = [];
    for (const item of items) {
      const link = item.locator(this.breadcrumbLinks);
      const text = item.locator(this.breadcrumbText);
      if (await link.count() > 0) labels.push(await link.innerText());
      else if (await text.count() > 0) labels.push(await text.innerText());
    }
    return labels;
  }

  async getDropdownItemLabels(): Promise<string[]> {
    const items = await this.page.locator(this.dropdownItems).all();
    return Promise.all(items.map(i => i.innerText()));
  }
}
