import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('sol-button', 'btn-primary-large');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="secondary" size="small">
        Small
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn-secondary-small');
  });

  it('renders all four variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'critical'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>V</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain(`btn-${variant}`);
      unmount();
    }
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fires onFocus and onBlur', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Button onFocus={handleFocus} onBlur={handleBlur}>Focus</Button>);
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(handleFocus).toHaveBeenCalled();
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled for disabledAltState', () => {
    render(<Button disabledAltState>Alt disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toHaveClass('disabled-alt-state');
    expect(btn).not.toBeDisabled();
  });

  it('passes aria attributes', () => {
    render(
      <Button
        ariaLabel="Close dialog"
        ariaDescribedBy="desc-id"
        ariaLabelledBy="label-id"
        ariaPressed={true}
        ariaExpanded={false}
      >
        X
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Close dialog');
    expect(btn).toHaveAttribute('aria-describedby', 'desc-id');
    expect(btn).toHaveAttribute('aria-labelledby', 'label-id');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets name, value, id, and type', () => {
    render(
      <Button id="btn-1" name="action" value="save" type="submit">
        Save
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('id', 'btn-1');
    expect(btn).toHaveAttribute('name', 'action');
    expect(btn).toHaveAttribute('value', 'save');
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('renders icon before and after text', () => {
    const IconLeft = () => <svg data-testid="icon-left" />;
    const IconRight = () => <svg data-testid="icon-right" />;
    render(
      <Button icon={<IconLeft />} iconEnd={<IconRight />}>
        Label
      </Button>
    );
    expect(screen.getByTestId('icon-left')).toBeInTheDocument();
    expect(screen.getByTestId('icon-right')).toBeInTheDocument();
  });

  it('renders icon-only button without text', () => {
    const Icon = () => <svg data-testid="icon" />;
    render(<Button icon={<Icon />} ariaLabel="Search" />);
    const btn = screen.getByRole('button', { name: 'Search' });
    expect(btn).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('exposes focus via ref', () => {
    const ref = { current: null } as React.RefObject<{ focus: () => void } | null>;
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.focus).toBe('function');
  });
});
