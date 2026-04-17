import { Locator, Page } from '@playwright/test';

export class SwitchPage {
  static DEFAULT_TIMEOUT = 2_000;
  static defaultSwitchSelector = '.sol-switch';

  selector: string;
  switch: Locator;
  switchButtonSelector: string;
  switchButton: Locator;
  switchLabelSelector: string;
  switchLabel: Locator;

  constructor(
    private page: Page,
    options?: { id?: string }
  ) {
    this.selector = SwitchPage.defaultSwitchSelector;
    if (options?.id) this.selector += `[id="${options.id}"]`;

    this.switch = page.locator(this.selector);
    this.switchButtonSelector = `${this.selector} button[role="switch"]`;
    this.switchButton = page.locator(this.switchButtonSelector);
    this.switchLabelSelector = `${this.selector} .sol-switch-label`;
    this.switchLabel = page.locator(this.switchLabelSelector);
  }

  getSwitchButtonIdSelector(id: number | string): string {
    return `#${id}-button`;
  }

  async clickSwitch(): Promise<void> {
    await this.page.click(this.switchButtonSelector);
  }

  async isChecked(): Promise<boolean> {
    return (await this.switchButton.getAttribute('aria-checked')) === 'true';
  }

  async isDisabled(): Promise<boolean> {
    return await this.switchButton.isDisabled();
  }

  async isReadonly(): Promise<boolean> {
    const classes = await this.switchButton.getAttribute('class');
    return classes?.includes('sol-readonly') ?? false;
  }
}
