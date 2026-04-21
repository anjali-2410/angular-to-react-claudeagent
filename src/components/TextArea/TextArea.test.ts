/// <reference path="../../vue-shim.d.ts" />
import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import TextArea from './TextArea.vue';

beforeAll(() => {
  // IntersectionObserver is not available in jsdom — provide a no-op stub
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const getTextarea = (container: Element) => container.querySelector('textarea') as HTMLTextAreaElement;

describe('TextArea', () => {
  it('should create component', () => {
    const { container } = render(TextArea);
    expect(container.querySelector('.sol-text-area')).toBeTruthy();
  });

  it('sets value from modelValue prop', () => {
    const { container } = render(TextArea, { props: { modelValue: 'text' } });
    expect(getTextarea(container).value).toBe('text');
  });

  it('when modelValue is empty then textarea is empty', () => {
    const { container } = render(TextArea, { props: { modelValue: '' } });
    expect(getTextarea(container).value).toBe('');
  });

  it('when modelValue is undefined then value should be empty string', () => {
    const { container } = render(TextArea, { props: { modelValue: undefined } });
    expect(getTextarea(container).value).toBe('');
  });

  it('disabled state disables the textarea', () => {
    const { container } = render(TextArea, { props: { disabled: true } });
    expect(getTextarea(container).disabled).toBe(true);
  });

  it('disabled state false keeps textarea enabled', () => {
    const { container } = render(TextArea, { props: { disabled: false } });
    expect(getTextarea(container).disabled).toBe(false);
  });

  it('emits update:modelValue on input', async () => {
    const { container, emitted } = render(TextArea);
    await fireEvent.input(getTextarea(container), { target: { value: 'hello' } });
    expect(emitted()['update:modelValue']).toBeTruthy();
  });

  it('emits valueChange on input', async () => {
    const { container, emitted } = render(TextArea);
    await fireEvent.input(getTextarea(container), { target: { value: 'hello' } });
    expect(emitted()['valueChange']).toEqual([['hello']]);
  });

  it('onChange stops event propagation', async () => {
    const { container } = render(TextArea);
    const event = new Event('change', { bubbles: true });
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    getTextarea(container).dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('should return true for overflowOrHidden when maxRows is not defined', () => {
    const { container } = render(TextArea, { props: { maxRows: undefined } });
    expect(getTextarea(container).classList.contains('hide-scroll')).toBe(true);
  });

  it('should return true for overflowOrHidden when numberOfLines is not defined', () => {
    const { container } = render(TextArea, { props: { maxRows: 5 } });
    expect(getTextarea(container).classList.contains('hide-scroll')).toBe(true);
  });

  it('should prevent default on Enter key when preventEnterKey is true', () => {
    const { container } = render(TextArea, { props: { preventEnterKey: true } });
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    getTextarea(container).dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should not prevent default on Enter key when Shift is pressed', () => {
    const { container } = render(TextArea, { props: { preventEnterKey: true } });
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    getTextarea(container).dispatchEvent(event);
    expect(preventSpy).not.toHaveBeenCalled();
  });

  it('should apply error-border class when errorState is true', () => {
    const { container } = render(TextArea, { props: { errorState: true } });
    expect(container.querySelector('.sol-input-container.error-border')).toBeTruthy();
  });

  it('should not apply error-border class when errorState is false', () => {
    const { container } = render(TextArea, { props: { errorState: false } });
    expect(container.querySelector('.sol-input-container.error-border')).toBeNull();
  });

  it('should show error message when errorState and errorMessage are set', () => {
    const { container } = render(TextArea, { props: { errorState: true, errorMessage: 'Required' } });
    expect(container.querySelector('.sol-error-message')?.textContent?.trim()).toBe('Required');
  });

  describe('ariaDescribedBy', () => {
    it('should return null when no maxLength is present', () => {
      const { container } = render(TextArea, { props: { maxLength: undefined } });
      expect(getTextarea(container).getAttribute('aria-describedby')).toBeNull();
    });

    it('should return counter ID when maxLength is set', () => {
      const { container } = render(TextArea, { props: { maxLength: 100 } });
      expect(getTextarea(container).getAttribute('aria-describedby')).toContain('text-counter-');
    });
  });

  describe('internalAriaLabel', () => {
    it('should set aria-label from label prop when no ariaLabel provided', () => {
      const { container } = render(TextArea, { props: { label: 'My Label' } });
      expect(getTextarea(container).getAttribute('aria-label')).toBe('My Label');
    });

    it('should not set aria-label when no label is provided', () => {
      const { container } = render(TextArea);
      expect(getTextarea(container).getAttribute('aria-label')).toBeNull();
    });

    it('should prefer ariaLabel prop over internal label-derived aria-label', () => {
      const { container } = render(TextArea, { props: { label: 'My Label', ariaLabel: 'Custom' } });
      expect(getTextarea(container).getAttribute('aria-label')).toBe('Custom');
    });
  });

  describe('character counter', () => {
    it('shows counter when maxLength is set and not readonly', () => {
      const { container } = render(TextArea, { props: { maxLength: 100, modelValue: 'hi' } });
      expect(container.querySelector('.sol-text-counter-text')?.textContent?.trim()).toBe('2/100');
    });

    it('hides counter when hideCharacterCounter is true', () => {
      const { container } = render(TextArea, { props: { maxLength: 100, hideCharacterCounter: true } });
      expect(container.querySelector('.sol-text-counter-text')).toBeNull();
    });

    it('hides counter when readonly is true', () => {
      const { container } = render(TextArea, { props: { maxLength: 100, readonly: true } });
      expect(container.querySelector('.sol-text-counter-text')).toBeNull();
    });
  });
});
