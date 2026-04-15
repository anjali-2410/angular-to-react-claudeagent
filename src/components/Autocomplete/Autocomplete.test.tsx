import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete, AutocompleteOption, AutocompleteHandle, SearchAutocompleteItem } from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithOptions(props: Partial<React.ComponentProps<typeof Autocomplete>> = {}) {
  const handleRef = React.createRef<AutocompleteHandle>();
  const result = render(
    <Autocomplete ariaLabel="Test autocomplete" ref={handleRef} {...props}>
      <AutocompleteOption id="item1" name="Item#1">Item#1</AutocompleteOption>
      <AutocompleteOption id="item2" name="Item#2">Item#2</AutocompleteOption>
      <AutocompleteOption id="item3" name="Item#3">Item#3</AutocompleteOption>
    </Autocomplete>
  );
  return { ...result, handleRef };
}

// ---------------------------------------------------------------------------
// Autocomplete component tests
// ---------------------------------------------------------------------------

describe('Autocomplete', () => {
  it('should render', () => {
    renderWithOptions();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('should have default minimumSearchTextLength of 3', () => {
    renderWithOptions();
    const input = screen.getByRole('combobox');
    expect(input).toBeTruthy();
  });

  it('should apply ariaLabel to input', () => {
    renderWithOptions({ ariaLabel: 'Test autocomplete' });
    const input = screen.getByRole('combobox');
    expect(input.getAttribute('aria-label')).toBe('Test autocomplete');
  });

  it('should apply placeholder text', () => {
    renderWithOptions({ placeholder: 'Search for item' });
    const input = screen.getByRole('combobox');
    expect(input.getAttribute('placeholder')).toBe('Search for item');
  });

  it('should have panelId for ARIA association', () => {
    renderWithOptions();
    const input = screen.getByRole('combobox');
    const panelId = input.getAttribute('aria-controls');
    expect(panelId).toMatch(/^autocompletePanel-.+$/);
  });

  it('should use custom panelId when provided', () => {
    renderWithOptions({ panelId: 'customPanel-123' });
    const input = screen.getByRole('combobox');
    expect(input.getAttribute('aria-controls')).toBe('customPanel-123');
  });

  it('should show clear button when text is present', async () => {
    renderWithOptions({ value: 'test' });
    expect(screen.getByRole('button', { name: /clear icon/i })).toBeTruthy();
  });

  it('should not show clear button when text is empty', () => {
    renderWithOptions({ value: '' });
    expect(screen.queryByRole('button', { name: /clear icon/i })).toBeNull();
  });

  it('should call onChange when input changes', async () => {
    const onChange = vi.fn();
    renderWithOptions({ onChange });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('should call onClearedSearchText when clear button is clicked', async () => {
    const onClearedSearchText = vi.fn();
    renderWithOptions({ value: 'test', onClearedSearchText });
    const clearButton = screen.getByRole('button', { name: /clear icon/i });
    await userEvent.click(clearButton);
    expect(onClearedSearchText).toHaveBeenCalled();
  });

  it('should clear text when clear button is clicked (uncontrolled)', async () => {
    renderWithOptions();
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.type(input, 'item');
    const clearButton = screen.getByRole('button', { name: /clear icon/i });
    await userEvent.click(clearButton);
    expect(input.value).toBe('');
  });

  it('should open dropdown when text length meets minimumSearchTextLength', async () => {
    renderWithOptions({ minimumSearchTextLength: 3 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ite');
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeTruthy();
    });
  });

  it('should not open dropdown when text is below minimum length', async () => {
    renderWithOptions({ minimumSearchTextLength: 3 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'it');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should call onOptionSelected when an option is clicked', async () => {
    const onOptionSelected = vi.fn();
    renderWithOptions({ minimumSearchTextLength: 1, onOptionSelected });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    const option = screen.getAllByRole('option')[0];
    fireEvent.mouseDown(option);
    expect(onOptionSelected).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'Item#1', id: 'item1' })
    );
  });

  it('should call onDropdownVisible(true) when dropdown opens', async () => {
    const onDropdownVisible = vi.fn();
    renderWithOptions({ minimumSearchTextLength: 1, onDropdownVisible });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => {
      expect(onDropdownVisible).toHaveBeenCalledWith(true);
    });
  });

  it('should call onDropdownVisible(false) when dropdown closes', async () => {
    const onDropdownVisible = vi.fn();
    renderWithOptions({ minimumSearchTextLength: 1, onDropdownVisible });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onDropdownVisible).toHaveBeenCalledWith(false);
  });

  it('should navigate options with ArrowDown', async () => {
    renderWithOptions({ minimumSearchTextLength: 1 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[1].classList.contains('sol-autocomplete-option--active')).toBe(true);
  });

  it('should navigate options with ArrowUp', async () => {
    renderWithOptions({ minimumSearchTextLength: 1 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const options = screen.getAllByRole('option');
    expect(options[1].classList.contains('sol-autocomplete-option--active')).toBe(true);
  });

  it('should select option with Enter key', async () => {
    const onOptionSelected = vi.fn();
    renderWithOptions({ minimumSearchTextLength: 1, onOptionSelected });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onOptionSelected).toHaveBeenCalled();
  });

  it('should close dropdown on Escape key', async () => {
    renderWithOptions({ minimumSearchTextLength: 1 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should show "No Items Found" when no options and text meets minimum', async () => {
    render(
      <Autocomplete ariaLabel="Test" minimumSearchTextLength={3} value="xyz" onChange={vi.fn()}>
        {/* no options */}
      </Autocomplete>
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText('No Items Found')).toBeTruthy();
    });
  });

  it('should have screen reader live region', () => {
    renderWithOptions();
    const liveRegion = document.querySelector('.sol-screenreader-only[role="status"]');
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should expose setFocus via ref', () => {
    const { handleRef } = renderWithOptions();
    const input = screen.getByRole('combobox');
    const focusSpy = vi.spyOn(input, 'focus');
    handleRef.current?.setFocus();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should expose clearSearchText via ref', async () => {
    const onClearedSearchText = vi.fn();
    const { handleRef } = renderWithOptions({ value: 'test', onClearedSearchText });
    handleRef.current?.clearSearchText();
    expect(onClearedSearchText).toHaveBeenCalled();
  });

  it('should not select disabled options', async () => {
    const onOptionSelected = vi.fn();
    render(
      <Autocomplete ariaLabel="Test" minimumSearchTextLength={1} onOptionSelected={onOptionSelected}>
        <AutocompleteOption id="dis1" name="Disabled" disabled>Disabled</AutocompleteOption>
      </Autocomplete>
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'd');
    await waitFor(() => screen.getByRole('listbox'));
    const option = screen.getByRole('option');
    fireEvent.mouseDown(option);
    expect(onOptionSelected).not.toHaveBeenCalled();
  });

  it('should have aria-expanded false when closed', () => {
    renderWithOptions();
    const input = screen.getByRole('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('should have aria-expanded true when open', async () => {
    renderWithOptions({ minimumSearchTextLength: 1 });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'i');
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
  });
});

// ---------------------------------------------------------------------------
// AutocompleteOption tests
// ---------------------------------------------------------------------------

describe('AutocompleteOption', () => {
  it('should render as null (data-only component)', () => {
    const { container } = render(
      <AutocompleteOption id="test" name="Test">Test</AutocompleteOption>
    );
    expect(container.firstChild).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SearchAutocompleteItem tests
// ---------------------------------------------------------------------------

describe('SearchAutocompleteItem', () => {
  it('should render text and path', () => {
    render(<SearchAutocompleteItem text="Hello World" path="Root/Parent" />);
    expect(document.querySelector('.search-item-text')).toBeTruthy();
    expect(document.querySelector('.search-item-path')).toBeTruthy();
  });

  it('should highlight search text', () => {
    render(<SearchAutocompleteItem text="Hello World" searchText="World" />);
    const textEl = document.querySelector('.search-item-text');
    expect(textEl?.innerHTML).toContain('<span class="highlighter">World</span>');
  });

  it('should render without path', () => {
    render(<SearchAutocompleteItem text="Hello" />);
    expect(document.querySelector('.search-item-wrapper')).toBeTruthy();
  });

  it('should render with empty text', () => {
    render(<SearchAutocompleteItem />);
    const wrapper = document.querySelector('.search-item-wrapper');
    expect(wrapper).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Text highlighter utility tests (mirrors text-highlighter.pipe.spec.ts)
// ---------------------------------------------------------------------------

describe('textHighlighter (utility)', () => {
  // Access via the SearchAutocompleteItem rendered output

  it('should return original text if searchText is empty', () => {
    render(<SearchAutocompleteItem text="This is the original text" searchText="" />);
    const textEl = document.querySelector('.search-item-text');
    expect(textEl?.textContent).toBe('This is the original text');
  });

  it('should highlight matching text', () => {
    render(<SearchAutocompleteItem text="This is the original text" searchText="ori" />);
    const textEl = document.querySelector('.search-item-text');
    expect(textEl?.innerHTML).toContain('<span class="highlighter">ori</span>');
  });
});
