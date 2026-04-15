import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionBar } from './ActionBar';

// ── ResizeObserver mock ────────────────────────────────────────────────────────
let resizeCallback: ResizeObserverCallback;
const mockObserver = {
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
};

const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.ResizeObserver = vi.fn((cb: ResizeObserverCallback) => {
    resizeCallback = cb;
    return mockObserver;
  });
});

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

// ── tippy mock — avoid DOM errors in jsdom ────────────────────────────────────
vi.mock('tippy.js', () => ({
  default: vi.fn(() => ({
    enable: vi.fn(),
    disable: vi.fn(),
    setContent: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ActionBar', () => {
  describe('visibility', () => {
    it('renders nothing when showActionBar is false (default)', () => {
      render(<ActionBar />);
      expect(document.querySelector('.sol-action-bar')).toBeNull();
    });

    it('renders the bar when showActionBar is true', () => {
      render(<ActionBar showActionBar />);
      expect(document.querySelector('.sol-action-bar')).toBeTruthy();
    });
  });

  describe('content', () => {
    it('displays actionBarTextContent', () => {
      render(<ActionBar showActionBar actionBarTextContent="Impersonating user" />);
      expect(screen.getByText('Impersonating user')).toBeTruthy();
    });

    it('displays buttonText', () => {
      render(<ActionBar showActionBar buttonText="Stop" />);
      expect(screen.getByText('Stop')).toBeTruthy();
    });

    it('renders the action button', () => {
      render(<ActionBar showActionBar buttonText="Stop" />);
      expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has role="region" with the provided ariaLabel', () => {
      render(<ActionBar showActionBar ariaLabel="Impersonation bar" />);
      expect(screen.getByRole('region', { name: 'Impersonation bar' })).toBeTruthy();
    });

    it('defaults ariaLabel to "Action bar"', () => {
      render(<ActionBar showActionBar />);
      expect(screen.getByRole('region', { name: 'Action bar' })).toBeTruthy();
    });

    it('adds role="status" and aria-live="polite" when liveMessage=true', () => {
      render(<ActionBar showActionBar liveMessage actionBarTextContent="Live text" />);
      const span = screen.getByText('Live text');
      expect(span.getAttribute('role')).toBe('status');
      expect(span.getAttribute('aria-live')).toBe('polite');
    });

    it('has no role="status" when liveMessage=false (default)', () => {
      render(<ActionBar showActionBar actionBarTextContent="Static text" />);
      const span = screen.getByText('Static text');
      expect(span.getAttribute('role')).toBeNull();
      expect(span.getAttribute('aria-live')).toBeNull();
    });

    it('links region to message via aria-describedby', () => {
      render(<ActionBar showActionBar actionBarTextContent="msg" />);
      const region = screen.getByRole('region');
      const messageId = region.getAttribute('aria-describedby');
      expect(messageId).toBeTruthy();
      expect(messageId && document.getElementById(messageId)).toBeTruthy();
    });
  });

  describe('button interaction', () => {
    it('calls onButtonClicked when the action button is clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<ActionBar showActionBar buttonText="Stop" onButtonClicked={handler} />);
      await user.click(screen.getByRole('button', { name: 'Stop' }));
      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('ResizeObserver', () => {
    it('creates a ResizeObserver when the bar becomes visible', () => {
      render(<ActionBar showActionBar />);
      expect(globalThis.ResizeObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalled();
    });

    it('disconnects the ResizeObserver when unmounted', () => {
      const { unmount } = render(<ActionBar showActionBar />);
      unmount();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });

    it('does not create a ResizeObserver when hidden', () => {
      render(<ActionBar showActionBar={false} />);
      expect(mockObserver.observe).not.toHaveBeenCalled();
    });
  });

  describe('applyEllipsis', () => {
    it('does not set tabIndex when text fits (not truncated)', () => {
      render(<ActionBar showActionBar actionBarTextContent="Short" />);
      const span = document.querySelector('.bar-label') as HTMLSpanElement;
      // Not truncated — no tabIndex
      expect(span.getAttribute('tabindex')).toBeNull();
    });

    it('sets tabIndex=0 when text is truncated', async () => {
      // jsdom returns 'normal' for lineHeight — mock it to a numeric value
      vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue({
        lineHeight: '20',
      } as CSSStyleDeclaration);

      render(
        <ActionBar
          showActionBar
          actionBarTextContent="Very long text that triggers truncation"
        />
      );

      const span = document.querySelector('.bar-label') as HTMLSpanElement;

      // Override scrollHeight to exceed MAX_LINES * lineHeight (4 * 20 = 80)
      Object.defineProperty(span, 'scrollHeight', {
        get() { return 999; },
        configurable: true,
      });

      resizeCallback([], mockObserver as ResizeObserver);

      await waitFor(() => {
        expect(span.getAttribute('tabindex')).toBe('0');
      });

      vi.restoreAllMocks();
    });
  });
});
