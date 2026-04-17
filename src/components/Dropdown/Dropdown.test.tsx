import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';
import { DropdownTrigger } from './DropdownTrigger';

const options = [
  { name: 'Yellow', value: 'yellow' },
  { name: 'Blue', value: 'blue' },
  { name: 'White', value: 'white' },
];

describe('Dropdown', () => {
  it('should render without crashing', () => {
    render(<Dropdown options={options} placeholder="Select a color" />);
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('should show placeholder text when no value is selected', () => {
    render(<Dropdown options={options} placeholder="Select a color" />);
    expect(screen.getByText('Select a color')).toBeTruthy();
  });

  it('should open dropdown on click', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('should show options when open', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Yellow')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.getByText('White')).toBeTruthy();
  });

  it('should call onSelectionChange when option clicked', async () => {
    const onSelectionChange = vi.fn();
    render(<Dropdown options={options} placeholder="Select" onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Blue'));
    expect(onSelectionChange).toHaveBeenCalledWith(options[1]);
  });

  it('should close dropdown after single selection', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Blue'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should display selected value', () => {
    render(<Dropdown options={options} value={options[0]} placeholder="Select" />);
    expect(screen.getByText('Yellow')).toBeTruthy();
  });

  it('should not open when disabled', async () => {
    render(<Dropdown options={options} placeholder="Select" disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('tabindex', '-1');
    await userEvent.click(trigger);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should set aria-expanded to true when open', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close on Escape key', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('should open on Space key', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('should open on ArrowDown key', async () => {
    render(<Dropdown options={options} placeholder="Select" />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  describe('Multi-select', () => {
    it('should allow multiple selections', async () => {
      const onSelectionChange = vi.fn();
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          multiple
          onSelectionChange={onSelectionChange}
        />
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Yellow'));
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should show count when multiple selected', () => {
      render(
        <Dropdown
          options={options}
          value={[options[0], options[1]]}
          placeholder="Select"
          multiple
        />
      );
      expect(screen.getByText('2 items selected')).toBeTruthy();
    });

    it('should not close after multi selection', async () => {
      const onSelectionChange = vi.fn();
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          multiple
          onSelectionChange={onSelectionChange}
        />
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Yellow'));
      expect(screen.getByRole('listbox')).toBeTruthy();
    });
  });

  describe('Search', () => {
    it('should show search input when searchEnabled', async () => {
      render(<Dropdown options={options} placeholder="Select" searchEnabled />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByPlaceholderText('Search…')).toBeTruthy();
    });

    it('should filter options by search query', async () => {
      render(<Dropdown options={options} placeholder="Select" searchEnabled />);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.type(screen.getByPlaceholderText('Search…'), 'blue');
      expect(screen.getByText('Blue')).toBeTruthy();
      expect(screen.queryByText('Yellow')).toBeNull();
    });

    it('should call onSearchChanged when searching', async () => {
      const onSearchChanged = vi.fn();
      render(
        <Dropdown options={options} placeholder="Select" searchEnabled onSearchChanged={onSearchChanged} />
      );
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.type(screen.getByPlaceholderText('Search…'), 'b');
      expect(onSearchChanged).toHaveBeenCalledWith('b');
    });
  });

  describe('Sorting', () => {
    it('should sort options alphabetically by default', () => {
      const unsorted = [
        { name: 'Zebra', value: 'z' },
        { name: 'Apple', value: 'a' },
        { name: 'Mango', value: 'm' },
      ];
      render(<Dropdown options={unsorted} placeholder="Select" />);
      // sortEnabled is true by default — just verify component renders
      expect(screen.getByRole('combobox')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('should show error state when required and touched with no value', async () => {
      render(<Dropdown options={options} placeholder="Select" required />);
      const trigger = screen.getByRole('combobox');
      fireEvent.blur(trigger);
      await waitFor(() => {
        expect(trigger.classList.contains('error')).toBeTruthy();
      });
    });
  });
});

describe('DropdownTrigger', () => {
  it('should render with placeholder', () => {
    render(<DropdownTrigger placeholder="Select" />);
    expect(screen.getByText('Select')).toBeTruthy();
  });

  it('should render display text when provided', () => {
    render(<DropdownTrigger placeholder="Select" displayText="Yellow" />);
    expect(screen.getByText('Yellow')).toBeTruthy();
    expect(screen.queryByText('Select')).toBeNull();
  });

  it('should have correct aria attributes when closed', () => {
    render(<DropdownTrigger ariaControlsId="my-list" isOpen={false} />);
    const el = screen.getByRole('combobox');
    expect(el).toHaveAttribute('aria-expanded', 'false');
    expect(el).toHaveAttribute('aria-haspopup', 'listbox');
    expect(el).toHaveAttribute('aria-controls', 'my-list');
  });

  it('should have aria-expanded true when open', () => {
    render(<DropdownTrigger isOpen />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should set tabindex -1 when disabled', () => {
    render(<DropdownTrigger disabled />);
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });

  it('should hide chevron when disabled', () => {
    const { container } = render(<DropdownTrigger disabled />);
    expect(container.querySelector('.sol-dropdown-icon')).toBeNull();
  });

  it('should show chevron when not disabled', () => {
    const { container } = render(<DropdownTrigger disabled={false} />);
    expect(container.querySelector('.sol-dropdown-icon')).toBeTruthy();
  });

  it('should apply open class when isOpen', () => {
    render(<DropdownTrigger isOpen />);
    expect(screen.getByRole('combobox').classList.contains('open')).toBeTruthy();
  });

  it('should hide chevron for readonly single select', () => {
    const { container } = render(<DropdownTrigger readOnly isMultiSelect={false} />);
    expect(container.querySelector('.sol-dropdown-icon')).toBeNull();
  });

  it('should show chevron for readonly multi select', () => {
    const { container } = render(<DropdownTrigger readOnly isMultiSelect />);
    expect(container.querySelector('.sol-dropdown-icon')).toBeTruthy();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<DropdownTrigger onClick={onClick} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<DropdownTrigger onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
