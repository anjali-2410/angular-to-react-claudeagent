/**
 * Breadcrumb stories — converted from breadcrumb.stories.ts
 * Story: AllScenarios (all breadcrumb configurations in one view)
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb/Examples',
  component: Breadcrumb,
  argTypes: {
    items: { control: 'object', description: 'Array of breadcrumb items to display' },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

const Section = ({
  heading,
  width,
  children,
}: {
  heading: string;
  width?: number;
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState('');
  return (
    <section>
      <h2 className="common-text" style={{ margin: '0 0 1rem 0' }}>
        {heading}
      </h2>
      <div style={{ width: width ? `${width}px` : '100%', border: '1px dashed #ccc', padding: '0.5rem' }}>
        {React.cloneElement(children as React.ReactElement, {
          onItemClicked: (data: { item: BreadcrumbItem }) => {
            setMessage(`${data.item.label} clicked!`);
            action('itemClicked')(data);
          },
        })}
      </div>
      {message && (
        <div
          className="click-message"
          style={{ padding: '0.5rem', marginTop: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}
        >
          {message}
        </div>
      )}
    </section>
  );
};

export const AllScenarios: Story = {
  name: 'AllScenarios',
  render: () => (
    <main>
      <h1 style={{ position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        Breadcrumb
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>

        <Section heading="Single Item with 100% width">
          <Breadcrumb ariaLabel="Single item breadcrumb" items={[{ label: 'Current Page Title' }]} />
        </Section>

        <Section heading="Two Items with 100% width">
          <Breadcrumb
            ariaLabel="Two items breadcrumb"
            items={[{ label: 'Parent name', path: '/parent' }, { label: 'Current Page Title' }]}
          />
        </Section>

        <Section heading="Three Items with 100% width">
          <Breadcrumb
            ariaLabel="Three items breadcrumb"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 1', path: '/level1' },
              { label: 'Current Page Title' },
            ]}
          />
        </Section>

        <Section heading="Four Items (No Truncation)">
          <Breadcrumb
            ariaLabel="Four items breadcrumb"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 2', path: '/level2' },
              { label: 'Parent Name', path: '/parent' },
              { label: 'Current Page Title' },
            ]}
          />
        </Section>

        <Section heading="Five Items (With Truncation Menu)">
          <Breadcrumb
            ariaLabel="Five items breadcrumb with truncation"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 1', path: '/level1' },
              { label: 'Level 2', path: '/level2' },
              { label: 'Parent Name', path: '/parent' },
              { label: 'Current Page Title' },
            ]}
          />
        </Section>

        <Section heading="Small Container" width={197}>
          <Breadcrumb
            ariaLabel="Small container breadcrumb"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 1', path: '/level1' },
              { label: 'Level 2', path: '/level2' },
              { label: 'Parent name', path: '/parent' },
              { label: 'Current Page Title' },
            ]}
          />
        </Section>

        <Section heading="Very Small Container" width={235}>
          <Breadcrumb
            ariaLabel="Very Small container with overflow"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 1', path: '/level1' },
              { label: 'Level 2', path: '/level2' },
              { label: 'Parent name with longer text', path: '/parent' },
              { label: 'Current Page Title' },
            ]}
          />
        </Section>

        <Section heading="Long Second-to-Last Item with Tooltip" width={250}>
          <Breadcrumb
            ariaLabel="Breadcrumb with long item and tooltip"
            items={[
              { label: 'Home', path: '/home' },
              { label: 'Level 1', path: '/level1' },
              { label: 'Level 2', path: '/level2' },
              {
                label: 'This is a very long parent name that will show ellipsis and tooltip',
                path: '/parent',
              },
              { label: 'Current Page' },
            ]}
          />
        </Section>

      </div>
    </main>
  ),
};
