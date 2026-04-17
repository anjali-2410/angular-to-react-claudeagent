'use client';

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders without crashing', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeDefined();
  });

  it('renders with label', () => {
    render(<Switch label="Test Switch" />);
    expect(screen.getByText('Test Switch')).toBeDefined();
  });

  it('reflects checked=false by default', () => {
    render(<Switch />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('reflects checked=true when passed', () => {
    render(<Switch checked={true} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('applies large class by default', () => {
    const { container } = render(<Switch />);
    expect(container.querySelector('.sol-switch')?.classList.contains('large')).toBe(true);
  });

  it('applies small class when size=small', () => {
    const { container } = render(<Switch size="small" />);
    expect(container.querySelector('.sol-switch')?.classList.contains('small')).toBe(true);
  });

  it('applies icon class when symbol=true', () => {
    const { container } = render(<Switch symbol={true} />);
    expect(container.querySelector('.sol-switch')?.classList.contains('icon')).toBe(true);
  });

  it('does not apply icon class when symbol=false', () => {
    const { container } = render(<Switch symbol={false} />);
    expect(container.querySelector('.sol-switch')?.classList.contains('icon')).toBe(false);
  });

  it('disables the button when disabled=true', () => {
    render(<Switch disabled={true} />);
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables the button when readonly=true', () => {
    render(<Switch readonly={true} />);
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true);
  });

  it('applies sol-readonly class when readonly=true', () => {
    render(<Switch readonly={true} />);
    expect(screen.getByRole('switch').classList.contains('sol-readonly')).toBe(true);
  });

  it('sets aria-label from ariaLabel prop', () => {
    render(<Switch ariaLabel="my toggle" />);
    expect(screen.getByRole('switch').getAttribute('aria-label')).toBe('my toggle');
  });

  it('falls back to label for aria-label when ariaLabel is not set', () => {
    render(<Switch label="Enable feature" />);
    expect(screen.getByRole('switch').getAttribute('aria-label')).toBe('Enable feature');
  });

  it('sets aria-labelledby when provided', () => {
    render(<Switch ariaLabelledby="heading-id" />);
    expect(screen.getByRole('switch').getAttribute('aria-labelledby')).toBe('heading-id');
  });

  it('sets aria-describedby when provided', () => {
    render(<Switch ariaDescribedby="desc-id" />);
    expect(screen.getByRole('switch').getAttribute('aria-describedby')).toContain('desc-id');
  });

  it('calls onCheckedChange with toggled value on click', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith({ checked: true });
  });

  it('calls onCheckedChange with false when currently checked', () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith({ checked: false });
  });

  it('does not call onCheckedChange when disabled', () => {
    const onChange = vi.fn();
    render(<Switch disabled={true} onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onCheckedChange when readonly', () => {
    const onChange = vi.fn();
    render(<Switch readonly={true} onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggles on Space key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith({ checked: true });
  });

  it('uses toggleId when provided', () => {
    render(<Switch toggleId="my-switch" />);
    expect(document.getElementById('my-switch-button')).toBeDefined();
  });

  it('shows interaction hint when interactive', () => {
    const { container } = render(
      <Switch interactionHint="Press Space to toggle" />
    );
    expect(container.querySelector('.sol-screenreader-only')).toBeTruthy();
  });

  it('hides interaction hint when disabled', () => {
    const { container } = render(
      <Switch disabled={true} interactionHint="Press Space to toggle" />
    );
    expect(container.querySelector('.sol-screenreader-only')).toBeNull();
  });

  it('hides interaction hint when readonly', () => {
    const { container } = render(
      <Switch readonly={true} interactionHint="Press Space to toggle" />
    );
    expect(container.querySelector('.sol-screenreader-only')).toBeNull();
  });

  it('forwards the name attribute', () => {
    render(<Switch name="mySwitch" />);
    expect(screen.getByRole('switch').getAttribute('name')).toBe('mySwitch');
  });

  it('sets aria-required when required=true', () => {
    render(<Switch required={true} />);
    expect(screen.getByRole('switch').getAttribute('aria-required')).toBe('true');
  });

  it('label htmlFor matches button id when toggleId is set', () => {
    render(<Switch toggleId="t1" label="Toggle" />);
    const label = screen.getByText('Toggle');
    expect(label.getAttribute('for')).toBe('t1-button');
  });
});
