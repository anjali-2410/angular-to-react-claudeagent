/**
 * Accordion interactive stories.
 * Converted from: accordion.stories.ts
 * Angular used mat-accordion + mat-expansion-panel; React uses AccordionGroup + AccordionItem.
 * Angular TemplateRef customHeader → React ReactNode customHeader prop.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { AccordionGroup } from '../Accordion';
import { AccordionItem } from '../AccordionItem';

const meta: Meta<typeof AccordionGroup> = {
  title: 'Components/Accordion/Examples',
  component: AccordionGroup,
  argTypes: {
    multiple: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionGroup>;

/** Custom header JSX — replaces Angular ng-template #customHeader */
const CustomHeader = () => (
  <span style={{ display: 'flex', gap: 'var(--sol-size-spacing-xs)', alignItems: 'center' }}>
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ padding: '0.25rem 0 0', width: 'var(--sol-size-icon-md)', height: 'var(--sol-size-icon-md)' }}
    >
      <path d="M12.8 16H3.2C1.44 16 0 14.56 0 12.8V10.4H11.2V12.8C11.2 13.68 11.92 14.4 12.8 14.4C13.68 14.4 14.4 13.68 14.4 12.8V1.6H3.2V8.8H1.6V0H16V12.8C16 14.56 14.56 16 12.8 16ZM1.6 12V12.8C1.6 13.68 2.32 14.4 3.2 14.4H10C9.76 13.92 9.6 13.36 9.6 12.8V12H1.6Z" />
      <path d="M4.8 3.2H6.4V4.8H4.8V3.2Z" />
      <path d="M8 3.2H12.8V4.8H8V3.2Z" />
      <path d="M4.8 6.4H6.4V8H4.8V6.4Z" />
      <path d="M8 6.4H12.8V8H8V6.4Z" />
    </svg>
    Accordion Details
  </span>
);

const AccordionTemplate = (args: { multiple: boolean }) => (
  <main className="sol-panel">
    <AccordionGroup multiple={args.multiple}>
      <AccordionItem
        customHeader={<CustomHeader />}
        disabled
        onOpened={action('Opened')}
        onClosed={action('Closed')}
        onToggle={action('Toggle')}
      >
        <p>This is the primary content of the panel.</p>
      </AccordionItem>
      <AccordionItem
        header="Accordion 2"
        selected
        onOpened={action('Opened')}
        onClosed={action('Closed')}
        onToggle={action('Toggle')}
      >
        <p id="pInsideAccordionItem" style={{ margin: 0 }}>
          This is the content inside
        </p>
        <p style={{ margin: 0 }}>
          Interdum non eleifend aliquet viverra erat etiam netus fusce duis, nisl sodales rhoncus
          turpis consequat dolor lacus dapibus curae, rutrum orci auctor maecenas et varius netus
          aenean.
        </p>
      </AccordionItem>
      <AccordionItem
        header="Accordion 3"
        onOpened={action('Opened')}
        onClosed={action('Closed')}
        onToggle={action('Toggle')}
      >
        <p style={{ margin: 0 }}>This is the content of the panel.</p>
        <p style={{ margin: 0 }}>more text</p>
      </AccordionItem>
      <AccordionItem
        customHeader={<CustomHeader />}
        onOpened={action('Opened')}
        onClosed={action('Closed')}
        onToggle={action('Toggle')}
      >
        <p style={{ margin: 0 }}>This is also the content of the panel.</p>
      </AccordionItem>
    </AccordionGroup>
  </main>
);

export const Single: Story = {
  name: 'Single',
  args: { multiple: false },
  render: args => <AccordionTemplate multiple={args.multiple ?? false} />,
};

export const Multiple: Story = {
  name: 'Multiple',
  args: { multiple: true },
  render: args => <AccordionTemplate multiple={args.multiple ?? false} />,
};
