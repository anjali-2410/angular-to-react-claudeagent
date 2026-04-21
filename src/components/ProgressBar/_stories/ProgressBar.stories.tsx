import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, useRef } from 'react';
import { ProgressBar } from '../ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Progress Bar/Examples',
  component: ProgressBar,
  argTypes: {
    progress: {
      control: 'number',
      description: 'The current progress value (0-100)',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for accessibility',
    },
    ariaHidden: {
      control: 'boolean',
      description: 'Whether to hide the progress bar from screen readers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

function ProgressBarDeterminateStory(args: Readonly<{ progress?: number; ariaHidden?: boolean; ariaLabel?: string }>) {
  const [progress, setProgress] = useState(args.progress);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoProgress = () => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      setIsRunning(true);
      if (progress === 100) setProgress(args.progress);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = Math.min(100, (prev ?? 0) + 4);
          if (next === 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
          }
          return next;
        });
      }, 400);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <>
      <header><h1 className="heading">Progress Bar Determinate With Full Width</h1></header>
      <main>
        <ProgressBar progress={progress} ariaHidden={args.ariaHidden} ariaLabel={args.ariaLabel} />
        <div style={{ marginTop: '10px', gap: '10px', display: 'flex' }}>
          <button onClick={startAutoProgress}>
            {isRunning ? 'Stop Progress' : 'Start Auto Progress'}
          </button>
        </div>
        <p>Current Progress: {progress}%</p>
      </main>
    </>
  );
}

export const ProgressBarDeterminate: Story = {
  args: {
    progress: 20,
    ariaLabel: 'Progress',
    ariaHidden: false,
  },
  render: args => <ProgressBarDeterminateStory {...args} />,
};

function MultipleProgressBarStory(args: Readonly<{ progress1: number; progress2: number }>) {
  return (
    <>
      <header><h1 className="heading">Multiple Progress Bars Determinate</h1></header>
      <main>
        <div className="sol-progress-bar-wrapper">
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ width: '350px' }}>
              <h2 className="heading heading-md">Progress Bar 1</h2>
              <ProgressBar progress={args.progress1} />
            </div>
            <div style={{ width: '350px' }}>
              <h2 className="heading heading-md">Progress Bar 2</h2>
              <ProgressBar progress={args.progress2} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const MultipleProgressBarDeterminate: StoryObj<{ progress1: number; progress2: number }> = {
  argTypes: {
    progress1: {
      control: 'number',
      description: 'Progress value for first progress bar (0-100)',
    },
    progress2: {
      control: 'number',
      description: 'Progress value for second progress bar (0-100)',
    },
  },
  args: {
    progress1: 75,
    progress2: 50,
  },
  render: args => <MultipleProgressBarStory {...args} />,
};
