import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  describe('basic rendering', () => {
    it('renders without errors', () => {
      render(<Chip />);
      expect(document.querySelector('.sol-chip')).toBeTruthy();
    });

    it('renders with default medium size and basic variant', () => {
      render(<Chip />);
      const chip = document.querySelector('.sol-chip');
      expect(chip?.classList).toContain('basic');
      expect(chip?.classList).toContain('medium');
    });

    it('uses provided id', () => {
      render(<Chip id="sampleId" />);
      expect(document.querySelector('#sampleId')).toBeTruthy();
    });

    it('auto-generates id when not provided', () => {
      render(<Chip />);
      const chip = document.querySelector('.sol-chip') as HTMLElement;
      expect(chip.id).toMatch(/^sol-chip-\d+$/);
    });

    it('renders label text', () => {
      render(<Chip label="Main Label" />);
      expect(screen.getByText('Main Label')).toBeTruthy();
    });

    it('renders subLabel text', () => {
      render(<Chip subLabel="SubLabel" />);
      expect(screen.getByText('SubLabel')).toBeTruthy();
    });

    it('renders icon when provided', () => {
      render(<Chip icon={<svg data-testid="chip-icon" />} />);
      expect(screen.getByTestId('chip-icon')).toBeTruthy();
    });
  });

  describe('size and variant', () => {
    it('applies large size class', () => {
      render(<Chip size="large" />);
      expect(document.querySelector('.sol-chip')?.classList).toContain('large');
    });

    it('applies small size class', () => {
      render(<Chip size="small" />);
      expect(document.querySelector('.sol-chip')?.classList).toContain('small');
    });

    it('applies primary variant class', () => {
      render(<Chip variant="primary" />);
      expect(document.querySelector('.sol-chip')?.classList).toContain('primary');
    });

    it('applies error class to inner div when errorState=true', () => {
      render(<Chip errorState />);
      expect(document.querySelector('.sol-chip > div.error')).toBeTruthy();
    });
  });

  describe('close button', () => {
    it('shows close button when allowClose=true', () => {
      render(<Chip allowClose />);
      expect(document.querySelector('.close-icon')).toBeTruthy();
    });

    it('does not show close button by default', () => {
      render(<Chip />);
      expect(document.querySelector('.close-icon')).toBeNull();
    });

    it('calls onClosed when close button is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Chip allowClose onClosed={handler} />);
      await user.click(document.querySelector('.close-icon') as HTMLElement);
      expect(handler).toHaveBeenCalledOnce();
    });

    it('stops propagation — onChipClicked not fired when close is clicked', async () => {
      const user = userEvent.setup();
      const chipClicked = vi.fn();
      const onClosed = vi.fn();
      render(<Chip allowClose onChipClicked={chipClicked} onClosed={onClosed} />);
      await user.click(document.querySelector('.close-icon') as HTMLElement);
      expect(onClosed).toHaveBeenCalled();
      expect(chipClicked).not.toHaveBeenCalled();
    });

    it('uses closeIconAriaLabel', () => {
      render(<Chip allowClose closeIconAriaLabel="Dismiss" />);
      expect(document.querySelector('.close-icon')?.getAttribute('aria-label')).toBe('Dismiss');
    });

    it('close icon is aria-hidden by default and revealed on focus', () => {
      render(<Chip allowClose />);
      const closeBtn = document.querySelector('.close-icon') as HTMLElement;
      expect(closeBtn.getAttribute('aria-hidden')).toBe('true');
      fireEvent.focus(closeBtn);
      expect(closeBtn.getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('chip click', () => {
    it('calls onChipClicked when chip is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Chip label="Click me" onChipClicked={handler} />);
      await user.click(screen.getByText('Click me'));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('calls onChipKeydown on keydown', () => {
      const handler = vi.fn();
      render(<Chip onChipKeydown={handler} />);
      fireEvent.keyDown(document.querySelector('.sol-chip') as HTMLElement, { code: 'Tab' });
      expect(handler).toHaveBeenCalled();
    });

    it('calls onCloseButtonKeydown on close button keydown', () => {
      const handler = vi.fn();
      render(<Chip allowClose onCloseButtonKeydown={handler} />);
      fireEvent.keyDown(document.querySelector('.close-icon') as HTMLElement, { code: 'Tab' });
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('sets tabIndex on chip', () => {
      render(<Chip chipTabIndex="2" />);
      expect(document.querySelector('.sol-chip')?.getAttribute('tabindex')).toBe('2');
    });

    it('sets role on chip', () => {
      render(<Chip chipRole="option" />);
      expect(document.querySelector('.sol-chip')?.getAttribute('role')).toBe('option');
    });
  });

  describe('editable label', () => {
    it('renders label-edit-mode span when labelEditable=true', () => {
      render(<Chip label="Edit me" labelEditable />);
      expect(document.querySelector('.label-edit-mode')).toBeTruthy();
    });

    it('calls onLabelChanged when label is edited and blurred', () => {
      const handler = vi.fn();
      render(<Chip label="Original" labelEditable onLabelChanged={handler} />);
      const editSpan = document.querySelector('.label-edit-mode') as HTMLSpanElement;
      // Simulate entering edit mode by double-clicking
      fireEvent.doubleClick(editSpan);
      // Simulate text change
      editSpan.textContent = 'Updated';
      fireEvent.blur(editSpan);
      expect(handler).toHaveBeenCalledWith('Updated');
    });
  });

  describe('editable subLabel', () => {
    it('renders sub-label-edit-mode span when subLabelEditable=true', () => {
      render(<Chip subLabel="Edit sub" subLabelEditable />);
      expect(document.querySelector('.sub-label-edit-mode')).toBeTruthy();
    });
  });
});
