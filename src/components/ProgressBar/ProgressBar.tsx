import React, { useEffect, useRef, useState } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  progress?: number;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;
const ANNOUNCEMENT_INTERVAL_MS = 2000;
const ANNOUNCEMENT_STEP_PERCENTAGE = 15;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  ariaLabel,
  ariaHidden = false,
}) => {
  const [ariaProgressbar, setAriaProgressbar] = useState(0);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAnnouncedRef = useRef(0);
  const progressRef = useRef(progress);
  const ariaProgressbarRef = useRef(ariaProgressbar);

  progressRef.current = progress;
  ariaProgressbarRef.current = ariaProgressbar;

  useEffect(() => {
    if (progress === MAX_PERCENTAGE) {
      setAriaProgressbar(MAX_PERCENTAGE);
      lastAnnouncedRef.current = MAX_PERCENTAGE;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    if (progress > MIN_PERCENTAGE && ariaProgressbarRef.current === MAX_PERCENTAGE) {
      setAriaProgressbar(MIN_PERCENTAGE);
      lastAnnouncedRef.current = MIN_PERCENTAGE;
    }

    if (progress > MIN_PERCENTAGE && !intervalIdRef.current) {
      intervalIdRef.current = setInterval(() => {
        const current = progressRef.current;
        if (
          current > MIN_PERCENTAGE &&
          (current - lastAnnouncedRef.current >= ANNOUNCEMENT_STEP_PERCENTAGE ||
            current === MAX_PERCENTAGE)
        ) {
          setAriaProgressbar(current);
          lastAnnouncedRef.current = current;
        }
      }, ANNOUNCEMENT_INTERVAL_MS);
    }
  }, [progress]);

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  const clampedProgress = Math.min(progress, MAX_PERCENTAGE);

  return (
    <div className="sol-progress-bar-determinate">
      {progress > 0 && (
        <div
          className="sol-progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
          aria-label={ariaProgressbar ? `${ariaLabel ?? ''}${ariaProgressbar}%` : ''}
          aria-hidden={ariaHidden || undefined}
          role="alert"
        />
      )}
    </div>
  );
};
