import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

vi.mock('tippy.js', () => ({
  default: vi.fn(() => ({ destroy: vi.fn(), enable: vi.fn(), disable: vi.fn() })),
}));

describe('Label', () => {
  it('should render nothing when label is empty', () => {
    const { container } = render(<Label label="" />);
    expect(container.querySelector('label')).toBeNull();
  });

  it('should render when label is provided', () => {
    render(<Label label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeDefined();
  });

  it('should set htmlFor when labelFor is provided', () => {
    render(<Label label="Test Label" labelFor="test-input" />);
    const label = screen.getByText('Test Label').closest('label');
    expect(label?.getAttribute('for')).toBe('test-input');
  });

  it('should show asterisk when required is true', () => {
    const { container } = render(<Label label="Test Label" required={true} />);
    expect(container.querySelector('.sol-label-asterisk')).toBeTruthy();
    expect(container.querySelector('.sol-label-asterisk')?.textContent).toContain('*');
  });

  it('should not show asterisk when required is false', () => {
    const { container } = render(<Label label="Test Label" required={false} />);
    expect(container.querySelector('.sol-label-asterisk')).toBeNull();
  });

  it('should apply disabled class when disabled is true', () => {
    const { container } = render(<Label label="Test Label" disabled={true} />);
    expect(container.querySelector('label')?.classList.contains('disabled')).toBe(true);
  });

  it('should not apply disabled class when disabled is false', () => {
    const { container } = render(<Label label="Test Label" disabled={false} />);
    expect(container.querySelector('label')?.classList.contains('disabled')).toBe(false);
  });

  it('should apply readonly class when readonly is true', () => {
    const { container } = render(<Label label="Test Label" readonly={true} />);
    expect(container.querySelector('label')?.classList.contains('readonly')).toBe(true);
  });

  it('should not apply readonly class when readonly is false', () => {
    const { container } = render(<Label label="Test Label" readonly={false} />);
    expect(container.querySelector('label')?.classList.contains('readonly')).toBe(false);
  });

  it('should show help icon when labelHelpText is provided', () => {
    const { container } = render(<Label label="Test Label" labelHelpText="This is help text" />);
    expect(container.querySelector('.sol-label-help')).toBeTruthy();
  });

  it('should not show help icon when labelHelpText is empty', () => {
    const { container } = render(<Label label="Test Label" labelHelpText="" />);
    expect(container.querySelector('.sol-label-help')).toBeNull();
  });

  it('should have empty labelHelpText by default', () => {
    const { container } = render(<Label label="Test Label" />);
    expect(container.querySelector('.sol-label-help')).toBeNull();
  });

  describe('Disabled state behavior', () => {
    it('should hide both required indicator and help icon when disabled is true', () => {
      const { container } = render(
        <Label label="Test Label" required={true} labelHelpText="Help text" disabled={true} />
      );
      expect(container.querySelector('.sol-label-asterisk')).toBeNull();
      expect(container.querySelector('.sol-label-help')).toBeNull();
    });
  });

  describe('Readonly state behavior', () => {
    it('should hide required indicator but keep help icon when readonly is true', () => {
      const { container } = render(
        <Label label="Test Label" required={true} labelHelpText="Help text" readonly={true} />
      );
      expect(container.querySelector('.sol-label-asterisk')).toBeNull();
      expect(container.querySelector('.sol-label-help')).toBeTruthy();
    });
  });

  describe('State toggling behavior', () => {
    it('should show icons when disabled is false with required and help text', () => {
      const { container } = render(
        <Label label="Test Label" required={true} labelHelpText="Help text" disabled={false} />
      );
      expect(container.querySelector('.sol-label-asterisk')).toBeTruthy();
      expect(container.querySelector('.sol-label-help')).toBeTruthy();
    });

    it('should show required icon when not readonly', () => {
      const { container } = render(
        <Label label="Test Label" required={true} labelHelpText="Help text" readonly={false} />
      );
      expect(container.querySelector('.sol-label-asterisk')).toBeTruthy();
      expect(container.querySelector('.sol-label-help')).toBeTruthy();
    });

    it('should handle combined disabled=false readonly=false state', () => {
      const { container } = render(
        <Label label="Test Label" required={true} labelHelpText="Help text" disabled={false} readonly={false} />
      );
      expect(container.querySelector('.sol-label-asterisk')).toBeTruthy();
      expect(container.querySelector('.sol-label-help')).toBeTruthy();
    });
  });
});
