import { Locator, Page } from '@playwright/test';

/**
 * ChipGroup E2E page object — converted from chip-group.page.ts.
 * All CSS selectors identical to Angular source; no CDK-specific selectors used.
 */
export class ChipGroupPage {
  static DEFAULT_TIMEOUT = 2_000;

  private readonly solTagsWrapper = '.sol-tags-wrapper';

  selector: string;
  chipGroupSelector: string;
  chipGroup: Locator;
  showMoreSelector: string;
  showMore: Locator;
  showLessSelector: string;
  showLess: Locator;
  showMorePopoverSelector: string;
  showMorePopover: Locator;
  showMorePopoverChipsSelector: string;
  showMorePopoverChips: Locator;
  clearAllSelector: string;
  clearAll: Locator;

  constructor(
    private page: Page,
    options?: { id?: string }
  ) {
    this.chipGroupSelector = '.sol-chip-group';
    if (options?.id) this.chipGroupSelector += `[id="${options.id}"]`;
    this.selector = this.chipGroupSelector;
    this.chipGroup = page.locator(this.chipGroupSelector);

    this.showMoreSelector = `${this.chipGroupSelector} ${this.solTagsWrapper} .sol-chip-group-buttons-container .show-more button`;
    this.showMore = page.locator(this.showMoreSelector);

    this.showLessSelector = `${this.chipGroupSelector} ${this.solTagsWrapper} .sol-chip-group-buttons-container .show-less button`;
    this.showLess = page.locator(this.showLessSelector);

    this.clearAllSelector = `${this.chipGroupSelector} ${this.solTagsWrapper} .sol-chip-group-buttons-container .clear-all button`;
    this.clearAll = page.locator(this.clearAllSelector);

    this.showMorePopoverSelector = '.sol-chip-group-popover';
    this.showMorePopover = page.locator(this.showMorePopoverSelector);

    this.showMorePopoverChipsSelector = `${this.showMorePopoverSelector} .sol-chip`;
    this.showMorePopoverChips = page.locator(this.showMorePopoverChipsSelector);
  }

  private getChipLabel(chipSelector: string) {
    return `${chipSelector} .main-label`;
  }

  private getChipCloseIcon(chipSelector: string) {
    return `${chipSelector} .close-icon`;
  }

  getChipSelectorById(primaryKey: string) {
    return `${this.chipGroupSelector} ${this.solTagsWrapper} .visible-items.chip-item #sol-visible-chip-${primaryKey}`;
  }

  getChipCloseIconSelectorById(primaryKey: string) {
    return this.getChipCloseIcon(this.getChipSelectorById(primaryKey));
  }

  async getChipLabelTextById(primaryKey: string) {
    return await this.page.locator(this.getChipLabel(this.getChipSelectorById(primaryKey))).innerText();
  }

  getChipSelectorByIndex(index: number) {
    return `${this.chipGroupSelector} ${this.solTagsWrapper} .visible-items.chip-item [data-chip-index="${index}"]`;
  }

  getChipByIndex(index: number) {
    return this.page.locator(this.getChipSelectorByIndex(index));
  }

  getChipCloseIconSelectorByIndex(index: number) {
    return this.getChipCloseIcon(this.getChipSelectorByIndex(index));
  }

  async getChipLabelTextByIndex(index: number) {
    return await this.page.locator(this.getChipLabel(this.getChipSelectorByIndex(index))).innerText();
  }

  async getShowMoreText() {
    return await this.showMore.innerText();
  }

  async clickShowMoreButton() {
    return await this.showMore.click();
  }

  async clickShowLessButton() {
    return await this.showLess.click();
  }

  async removeTag(tagName: string) {
    const chipSelector = `${this.solTagsWrapper} .visible-items [data-chip-label="${tagName}"] .close-icon`;
    const chip = this.page.locator(chipSelector);
    if (await chip.isVisible()) {
      await chip.click();
      await chip.waitFor({ state: 'detached' });
    }
  }
}
