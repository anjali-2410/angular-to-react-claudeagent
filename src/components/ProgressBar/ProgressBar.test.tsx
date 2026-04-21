import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ProgressBar } from './ProgressBar';

const getTrack = () => document.querySelector('.sol-progress-bar-determinate');
const getFill = () => document.querySelector('.sol-progress-bar-fill') as HTMLElement | null;

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('should create component', () => {
      const { container } = render(<ProgressBar />);
      expect(container.querySelector('.sol-progress-bar-determinate')).toBeTruthy();
    });

    it('should not show progress bar when progress is 0', () => {
      render(<ProgressBar progress={0} />);
      expect(getFill()).toBeNull();
    });

    it('should show progress bar when progress > 0', () => {
      render(<ProgressBar progress={50} />);
      expect(getFill()).toBeTruthy();
    });

    it('should set correct width style for progress', () => {
      render(<ProgressBar progress={75} />);
      expect(getFill()?.style.width).toBe('75%');
    });

    it('should cap width at 100% when progress exceeds 100', () => {
      render(<ProgressBar progress={150} />);
      expect(getFill()?.style.width).toBe('100%');
    });

    it('should set role to alert', () => {
      render(<ProgressBar progress={50} />);
      expect(getFill()?.getAttribute('role')).toBe('alert');
    });

    it('should respect ariaHidden input', () => {
      render(<ProgressBar progress={50} ariaHidden={true} />);
      expect(getFill()?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Aria Label', () => {
    it('should not display aria label initially before first announcement', () => {
      render(<ProgressBar progress={25} />);
      expect(getFill()?.getAttribute('aria-label')).toBe('');
    });

    it('should not display custom aria label initially before first announcement', () => {
      render(<ProgressBar progress={40} ariaLabel="Downloading files" />);
      expect(getFill()?.getAttribute('aria-label')).toBe('');
    });
  });

  describe('Announcement Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should announce when 15% gap is reached', async () => {
      const { rerender } = render(<ProgressBar progress={15} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={15} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('15%');
    });

    it('should announce at 30% when reached', async () => {
      const { rerender } = render(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={30} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={30} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('30%');
    });

    it('should announce immediately when reaching 100%', async () => {
      const { rerender } = render(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={100} />);
      rerender(<ProgressBar progress={100} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('100%');
    });

    it('should reset ariaProgressbar when restarting from 0 after 100%', async () => {
      const { rerender } = render(<ProgressBar progress={100} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={100} />);

      rerender(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={5} />);
      expect(getFill()?.getAttribute('aria-label')).toBe('');
    });

    it('should not announce intermediate values less than 15% gap', async () => {
      const { rerender } = render(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={10} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={10} />);
      expect(getFill()?.getAttribute('aria-label')).toBe('');
    });

    it('should skip intervals that do not meet 15% gap until 15% is reached', async () => {
      const { rerender } = render(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={10} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={20} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={20} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('20%');
    });

    it('should announce multiple 15% intervals', async () => {
      const { rerender } = render(<ProgressBar progress={15} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={15} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('15%');

      rerender(<ProgressBar progress={30} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={30} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('30%');

      rerender(<ProgressBar progress={45} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={45} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('45%');
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should stop announcement interval on destroy', () => {
      const { unmount } = render(<ProgressBar progress={10} />);
      vi.advanceTimersByTime(2000);
      expect(() => unmount()).not.toThrow();
    });

    it('should stop interval when progress reaches 100%', () => {
      const { rerender } = render(<ProgressBar progress={50} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={100} />);
      vi.advanceTimersByTime(4000);
      expect(getFill()?.getAttribute('aria-label')).toContain('100%');
    });

    it('should reset ariaProgressbar to 0 when progress stops (not at 100%)', () => {
      const { rerender } = render(<ProgressBar progress={50} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={0} />);
      vi.advanceTimersByTime(100);
      expect(getFill()).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle rapid progress changes', async () => {
      const { rerender } = render(<ProgressBar progress={5} />);
      vi.advanceTimersByTime(100);
      rerender(<ProgressBar progress={15} />);
      vi.advanceTimersByTime(100);
      rerender(<ProgressBar progress={25} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={25} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('25%');
    });

    it('should handle progress = 0 initially', () => {
      render(<ProgressBar progress={0} />);
      expect(getFill()).toBeNull();
    });

    it('should handle progress value exactly at 15%', async () => {
      const { rerender } = render(<ProgressBar progress={15} />);
      vi.advanceTimersByTime(2000);
      rerender(<ProgressBar progress={15} />);
      expect(getFill()?.getAttribute('aria-label')).toContain('15%');
    });
  });
});
