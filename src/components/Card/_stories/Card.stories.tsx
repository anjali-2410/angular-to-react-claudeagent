/**
 * Card stories — converted from card.stories.ts
 * Stories: CardWithBodyAndFooter, CardWithOnlyBody
 */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card, CardBody, CardFooter } from '../Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card/Examples',
  component: Card,
  argTypes: {
    useAlternativeBackgroundColor: { control: 'boolean' },
    divider: { control: 'boolean' },
    enableHover: { control: 'boolean' },
    selectable: { control: 'boolean' },
    selected: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const LOREM =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';

export const CardWithBodyAndFooter: Story = {
  name: 'CardWithBodyAndFooter',
  args: {
    useAlternativeBackgroundColor: false,
    divider: true,
    enableHover: false,
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Card component with body and footer</h1>
      <Card
        useAlternativeBackgroundColor={args.useAlternativeBackgroundColor}
        enableHover={args.enableHover}
        divider={args.divider}
      >
        <CardBody>
          <span>{LOREM}</span>
        </CardBody>
        <CardFooter>
          <span>{LOREM}</span>
        </CardFooter>
      </Card>
    </main>
  ),
};

export const CardWithOnlyBody: Story = {
  name: 'CardWithOnlyBody',
  args: {
    useAlternativeBackgroundColor: false,
    enableHover: false,
  },
  render: args => (
    <main>
      <h1 className="sol-screenreader-only">Card component with only body</h1>
      <Card
        useAlternativeBackgroundColor={args.useAlternativeBackgroundColor}
        enableHover={args.enableHover}
      >
        <CardBody>
          <span>{LOREM}</span>
        </CardBody>
      </Card>
    </main>
  ),
};
