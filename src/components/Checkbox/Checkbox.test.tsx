import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

describe('Checkbox', () => {
  describe('basic rendering', () => {
    it('renders without errors', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeTruthy();
    });

    it('is unchecked by default', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('shows label text via label prop', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeTruthy();
    });

    it('shows label text via children', () => {
      render(<Checkbox>Accept terms</Checkbox>);
      expect(screen.getByText('Accept terms')).toBeTruthy();
    });

    it('shows customContent over label and children', () => {
      render(
        <Checkbox label="label" customContent={<span>Custom</span>}>
          children
        </Checkbox>
      );
      expect(screen.getByText('Custom')).toBeTruthy();
      expect(screen.queryByText('label')).toBeNull();
      expect(screen.queryByText('children')).toBeNull();
    });

    it('renders required asterisk when label and required are set', () => {
      render(<Checkbox label="Name" required />);
      expect(screen.getByText('*')).toBeTruthy();
    });

    it('auto-generates a unique id when checkboxId is omitted', () => {
      render(<Checkbox label="A" />);
      expect(screen.getByRole('checkbox').id).toMatch(/^sol-checkbox-\d+$/);
    });

    it('uses the provided checkboxId', () => {
      render(<Checkbox checkboxId="my-box" label="A" />);
      expect(screen.getByRole('checkbox').id).toBe('my-box');
    });
  });

  describe('checked state', () => {
    it('reflects checked prop', () => {
      render(<Checkbox checked label="A" />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('reflects unchecked prop', () => {
      render(<Checkbox checked={false} label="A" />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('toggles internally when uncontrolled', async () => {
      const user = userEvent.setup();
      render(<Checkbox label="A" />);
      const input = screen.getByRole('checkbox');
      expect(input).not.toBeChecked();
      await user.click(input);
      expect(input).toBeChecked();
      await user.click(input);
      expect(input).not.toBeChecked();
    });

    it('calls onCheckedChange with new state on click', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Checkbox label="A" onCheckedChange={handler} />);
      await user.click(screen.getByRole('checkbox'));
      expect(handler).toHaveBeenCalledWith({ checked: true, indeterminate: false });
    });

    it('calls onClicked on every click', async () => {
      const user = userEvent.setup();
      const clicked = vi.fn();
      render(<Checkbox label="A" onClicked={clicked} />);
      await user.click(screen.getByRole('checkbox'));
      expect(clicked).toHaveBeenCalledTimes(1);
    });
  });

  describe('indeterminate state', () => {
    it('sets DOM indeterminate property when prop is true', () => {
      render(<Checkbox indeterminate />);
      expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
    });

    it('sets aria-checked to "mixed" when indeterminate', () => {
      render(<Checkbox indeterminate />);
      expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('mixed');
    });

    it('clears indeterminate on click and calls onIndeterminateChange', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Checkbox indeterminate onIndeterminateChange={handler} />);
      const input = screen.getByRole('checkbox') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
      await user.click(input);
      expect(input.indeterminate).toBe(false);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables the input', () => {
      render(<Checkbox disabled label="A" />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('does not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Checkbox disabled label="A" onCheckedChange={handler} />);
      await user.click(screen.getByRole('checkbox'));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('readonly state', () => {
    it('adds readonly class to input', () => {
      render(<Checkbox readonly label="A" />);
      expect(screen.getByRole('checkbox', { hidden: true }).className).toContain('readonly');
    });

    it('hides input from accessibility tree when readonly', () => {
      render(<Checkbox readonly label="A" />);
      expect(
        screen.getByRole('checkbox', { hidden: true }).getAttribute('aria-hidden')
      ).toBe('true');
    });

    it('does not call onCheckedChange when readonly', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Checkbox readonly label="A" checked={false} onCheckedChange={handler} />);
      await user.click(screen.getByRole('checkbox', { hidden: true }));
      expect(handler).not.toHaveBeenCalled();
    });

    it('calls onClicked even when readonly', async () => {
      const user = userEvent.setup();
      const clicked = vi.fn();
      render(<Checkbox readonly label="A" onClicked={clicked} />);
      await user.click(screen.getByRole('checkbox', { hidden: true }));
      expect(clicked).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('adds error-border class when errorState is true', () => {
      render(<Checkbox errorState label="A" />);
      expect(screen.getByRole('checkbox').className).toContain('error-border');
    });

    it('adds error-border class when errorMessage is provided', () => {
      render(<Checkbox errorMessage="Required" label="A" />);
      expect(screen.getByRole('checkbox').className).toContain('error-border');
    });

    it('renders error message text', () => {
      render(<Checkbox errorMessage="This is required" label="A" />);
      expect(screen.getByText('This is required')).toBeTruthy();
    });
  });

  describe('focus and blur', () => {
    it('calls onFocus when input is focused', () => {
      const handler = vi.fn();
      render(<Checkbox label="A" onFocus={handler} />);
      fireEvent.focus(screen.getByRole('checkbox'));
      expect(handler).toHaveBeenCalled();
    });

    it('calls onBlur when input is blurred', () => {
      const handler = vi.fn();
      render(<Checkbox label="A" onBlur={handler} />);
      fireEvent.blur(screen.getByRole('checkbox'));
      expect(handler).toHaveBeenCalled();
    });

    it('does not call onFocus when readonly', () => {
      const handler = vi.fn();
      render(<Checkbox readonly label="A" onFocus={handler} />);
      fireEvent.focus(screen.getByRole('checkbox', { hidden: true }));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});

describe('CheckboxGroup', () => {
  it('renders children', () => {
    render(
      <CheckboxGroup label="Options">
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('shows group label', () => {
    render(<CheckboxGroup label="Pick one" />);
    expect(screen.getByText('Pick one')).toBeTruthy();
  });

  it('reflects pre-selected values', () => {
    render(
      <CheckboxGroup value={['b']}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });

  it('calls onClicked with updated values when a checkbox is toggled', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <CheckboxGroup onClicked={handler}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(handler).toHaveBeenCalledWith(['a']);
  });

  it('removes value from selection when unchecked', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <CheckboxGroup value={['a', 'b']} onClicked={handler}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  it('does not add duplicate values', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <CheckboxGroup value={['a']} onClicked={handler}>
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>
    );
    await user.click(screen.getByRole('checkbox'));
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('propagates disabled state to all child checkboxes', () => {
    render(
      <CheckboxGroup disabled>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );
    screen.getAllByRole('checkbox').forEach(cb => expect(cb).toBeDisabled());
  });

  it('propagates readonly state to all child checkboxes', () => {
    render(
      <CheckboxGroup readonly>
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>
    );
    expect(
      screen.getByRole('checkbox', { hidden: true }).className
    ).toContain('readonly');
  });

  it('shows required asterisk on label', () => {
    render(<CheckboxGroup label="Items" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('shows external error message', () => {
    render(<CheckboxGroup errorMessage="Select at least one" />);
    expect(screen.getByText('Select at least one')).toBeTruthy();
  });

  it('suppresses individual checkbox error message when inside a group', () => {
    render(
      <CheckboxGroup errorMessage="Group error">
        <Checkbox value="a" errorMessage="Checkbox error">A</Checkbox>
      </CheckboxGroup>
    );
    expect(screen.getByText('Group error')).toBeTruthy();
    expect(screen.queryByText('Checkbox error')).toBeNull();
  });
});
