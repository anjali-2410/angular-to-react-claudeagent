import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('tippy.js', () => ({
  default: vi.fn(() => ({ destroy: vi.fn(), setContent: vi.fn(), enable: vi.fn(), disable: vi.fn() })),
}));

const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.ResizeObserver = vi.fn(cb => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
});

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const oneItem: BreadcrumbItem[] = [{ label: 'Current' }];
const twoItems: BreadcrumbItem[] = [{ label: 'Home', path: '/home' }, { label: 'Current' }];
const threeItems: BreadcrumbItem[] = [
  { label: 'Home', path: '/home' },
  { label: 'Parent', path: '/parent' },
  { label: 'Current' },
];
const fourItems: BreadcrumbItem[] = [
  { label: 'Home', path: '/home' },
  { label: 'Middle', path: '/middle' },
  { label: 'Parent', path: '/parent' },
  { label: 'Current' },
];
const fiveItems: BreadcrumbItem[] = [
  { label: 'Home', path: '/home' },
  { label: 'Level 1', path: '/l1' },
  { label: 'Level 2', path: '/l2' },
  { label: 'Parent', path: '/parent' },
  { label: 'Current' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Breadcrumb', () => {
  describe('basic rendering', () => {
    it('renders a nav element', () => {
      render(<Breadcrumb items={oneItem} />);
      expect(screen.getByRole('navigation')).toBeTruthy();
    });

    it('uses the default aria-label "Breadcrumb"', () => {
      render(<Breadcrumb items={oneItem} />);
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    });

    it('uses a custom ariaLabel', () => {
      render(<Breadcrumb items={oneItem} ariaLabel="Page location" />);
      expect(screen.getByRole('navigation', { name: 'Page location' })).toBeTruthy();
    });

    it('renders an ordered list', () => {
      render(<Breadcrumb items={twoItems} />);
      expect(document.querySelector('ol.sol-breadcrumb-list')).toBeTruthy();
    });
  });

  describe('single item', () => {
    it('renders the current-page text for a single item', () => {
      render(<Breadcrumb items={oneItem} />);
      expect(screen.getByText('Current')).toBeTruthy();
    });

    it('does NOT show home for a single item', () => {
      render(<Breadcrumb items={oneItem} />);
      expect(document.querySelectorAll('.sol-breadcrumb-link')).toHaveLength(0);
    });
  });

  describe('two items', () => {
    it('renders a link for the first item', () => {
      render(<Breadcrumb items={twoItems} />);
      expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
    });

    it('renders a non-link current page for the last item', () => {
      render(<Breadcrumb items={twoItems} />);
      expect(screen.getByText('Current').tagName).not.toBe('A');
    });

    it('renders a separator between items', () => {
      render(<Breadcrumb items={twoItems} />);
      expect(document.querySelector('.sol-breadcrumb-separator')).toBeTruthy();
    });
  });

  describe('three items', () => {
    it('renders home link, parent link, and current text', () => {
      render(<Breadcrumb items={threeItems} />);
      expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Parent' })).toBeTruthy();
      expect(screen.getByText('Current')).toBeTruthy();
    });
  });

  describe('four items', () => {
    it('renders all four labels', () => {
      render(<Breadcrumb items={fourItems} />);
      expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Middle' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Parent' })).toBeTruthy();
      expect(screen.getByText('Current')).toBeTruthy();
    });

    it('does NOT show the overflow menu button for exactly 4 items (no overflow)', () => {
      render(<Breadcrumb items={fourItems} />);
      expect(screen.queryByRole('button', { name: 'Show more breadcrumb items' })).toBeNull();
    });
  });

  describe('five+ items — overflow menu', () => {
    it('shows the overflow menu button for 5 items', () => {
      render(<Breadcrumb items={fiveItems} />);
      expect(screen.getByRole('button', { name: 'Show more breadcrumb items' })).toBeTruthy();
    });

    it('opens the dropdown when the overflow button is clicked', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb items={fiveItems} />);
      await user.click(screen.getByRole('button', { name: 'Show more breadcrumb items' }));
      expect(document.querySelector('.sol-breadcrumb-dropdown')).toBeTruthy();
    });

    it('shows middle items (not first/last/second-to-last) in the dropdown', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb items={fiveItems} />);
      await user.click(screen.getByRole('button', { name: 'Show more breadcrumb items' }));
      // Middle items: Level 1, Level 2 (index 1 and 2)
      expect(screen.getByText('Level 1')).toBeTruthy();
      expect(screen.getByText('Level 2')).toBeTruthy();
    });

    it('closes the dropdown when a menu item is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Home', path: '/home' },
        { label: 'Mid', path: '/mid' },
        { label: 'Mid2', path: '/mid2' },
        { label: 'Parent', path: '/parent' },
        { label: 'Current' },
      ];
      render(<Breadcrumb items={items} onItemClicked={handler} />);
      await user.click(screen.getByRole('button', { name: 'Show more breadcrumb items' }));
      await user.click(screen.getByText('Mid'));
      expect(document.querySelector('.sol-breadcrumb-dropdown')).toBeNull();
    });

    it('aria-expanded reflects open/closed state', async () => {
      const user = userEvent.setup();
      render(<Breadcrumb items={fiveItems} />);
      const btn = screen.getByRole('button', { name: 'Show more breadcrumb items' });
      expect(btn.getAttribute('aria-expanded')).toBe('false');
      await user.click(btn);
      expect(btn.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('item click handling', () => {
    it('calls onItemClicked with item and event for path items', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<Breadcrumb items={twoItems} onItemClicked={handler} />);
      await user.click(screen.getByRole('link', { name: 'Home' }));
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].item.label).toBe('Home');
    });

    it('calls item.handler directly without emitting onItemClicked', async () => {
      const user = userEvent.setup();
      const directHandler = vi.fn();
      const emitHandler = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Settings', handler: directHandler },
        { label: 'Current' },
      ];
      render(<Breadcrumb items={items} onItemClicked={emitHandler} />);
      await user.click(screen.getByRole('link', { name: 'Settings' }));
      expect(directHandler).toHaveBeenCalledOnce();
      expect(emitHandler).not.toHaveBeenCalled();
    });

    it('keyboard Enter triggers click on link items', () => {
      const handler = vi.fn();
      render(<Breadcrumb items={twoItems} onItemClicked={handler} />);
      fireEvent.keyDown(screen.getByRole('link', { name: 'Home' }), { key: 'Enter' });
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('last item (current page)', () => {
    it('sets aria-current="page" on the last item text', () => {
      render(<Breadcrumb items={threeItems} />);
      const last = screen.getByText('Current');
      expect(last.getAttribute('aria-current')).toBe('page');
    });

    it('applies .sol-breadcrumb-text-last class to the last item', () => {
      render(<Breadcrumb items={threeItems} />);
      expect(document.querySelector('.sol-breadcrumb-text-last')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('separators are aria-hidden', () => {
      render(<Breadcrumb items={threeItems} />);
      const separators = document.querySelectorAll('.sol-breadcrumb-separator');
      separators.forEach(sep => expect(sep.getAttribute('aria-hidden')).toBe('true'));
    });
  });

  describe('ResizeObserver', () => {
    it('creates a ResizeObserver on mount', () => {
      render(<Breadcrumb items={threeItems} />);
      expect(globalThis.ResizeObserver).toHaveBeenCalled();
    });

    it('disconnects the ResizeObserver on unmount', () => {
      const mockObserver = { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
      globalThis.ResizeObserver = vi.fn(() => mockObserver);
      const { unmount } = render(<Breadcrumb items={threeItems} />);
      unmount();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });
});
