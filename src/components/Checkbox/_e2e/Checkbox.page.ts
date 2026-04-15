/**
 * Checkbox E2E page-object selectors.
 * CSS class names are identical to Angular source so existing Playwright tests can be reused.
 *
 * Angular source: checkbox.page.ts + checkbox-group.page.ts
 */

export const CheckboxPage = {
  checkboxInput: 'input.sol-checkbox-inputbox',
  checkboxLabel: '.sol-checkbox-label-text',
} as const;

export const CheckboxGroupPage = {
  checkboxInput: '.sol-checkbox-inputbox',
  checkboxItem: '.checkbox-item',
  checkboxLabel: '.checkbox-label',
} as const;
