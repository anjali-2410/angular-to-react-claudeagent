/**
 * ChipGroup stories — converted from chip-group.stories.ts
 * Stories: withChipsExpansion, withPopover
 */
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { ChipGroup, type SelectedTag } from '../ChipGroup';

const meta: Meta<typeof ChipGroup> = {
  title: 'Components/Chip Group/Examples',
  component: ChipGroup,
  argTypes: {
    tagSize: {
      options: ['medium', 'small'],
      control: 'inline-radio',
    },
    overflowMode: {
      options: ['inline', 'popover'],
      control: 'inline-radio',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChipGroup>;

const initialTagsSource: SelectedTag[] = [
  { id: '1', text: 'Black Widow' },
  { id: '2', text: 'Doctor Strange' },
  { id: '3', text: 'Iron Man' },
  { id: '4', text: 'Spiderman' },
  { id: '5', text: 'Robin' },
  { id: '6', text: 'Hulk' },
  { id: '7', text: 'Vision' },
  { id: '8', text: 'Antman' },
  { id: '9', text: 'Shazam' },
  { id: '10', text: 'Superman' },
  { id: '11', text: 'Genoso' },
  { id: '12', text: 'Saitama' },
  { id: '13', text: 'Goku' },
  { id: '14', text: 'Thor' },
  { id: '15', text: 'Loki' },
  { id: '16', text: 'Wolverine' },
  { id: '17', text: 'Deadpool' },
  { id: '18', text: 'Captain America' },
  { id: '19', text: 'Black Panther' },
];

// ── Controlled wrapper ─────────────────────────────────────────────────────

function ChipGroupStory(args: {
  removable?: boolean;
  allowClearAll?: boolean;
  tagSize?: 'small' | 'medium';
  maxTagsToDisplay?: number;
  label?: string;
  id?: string;
  overflowMode?: 'inline' | 'popover';
}) {
  const [tags, setTags] = useState<SelectedTag[]>([...initialTagsSource]);

  return (
    <main>
      <h1 className="heading">Chip Group</h1>
      <ChipGroup
        id={args.id}
        tagSize={args.tagSize}
        removable={args.removable}
        allowClearAll={args.allowClearAll}
        maxTagsToDisplay={args.maxTagsToDisplay}
        tagsSource={tags}
        label={args.label}
        overflowMode={args.overflowMode}
        onDeleteAllClicked={() => {
          setTags([]);
          action('cleared all')();
        }}
        onTagsChanged={event => {
          setTags([...event.tags]);
          action('tags changed')(event);
        }}
        onViewMoreClicked={action('view more clicked')}
        onViewLessClicked={action('view less clicked')}
        onTagDeleted={tag => {
          action('tag deleted')(tag);
        }}
      />
      <p style={{ fontFamily: 'SOL Sans', fontSize: '.875rem' }}>
        (Resize the browser window to see the number of visible tags change.)
      </p>
    </main>
  );
}

// ── withChipsExpansion ─────────────────────────────────────────────────────

export const withChipsExpansion: Story = {
  name: 'withChipsExpansion',
  args: {
    removable: true,
    allowClearAll: true,
    tagSize: 'small',
    maxTagsToDisplay: 0,
    label: 'text',
    id: 'myChipGroup',
    overflowMode: 'inline',
  },
  render: args => <ChipGroupStory {...args} />,
};

// ── withPopover ───────────────────────────────────────────────────────────

export const withPopover: Story = {
  name: 'withPopover',
  args: {
    removable: true,
    allowClearAll: true,
    tagSize: 'small',
    maxTagsToDisplay: 0,
    label: 'text',
    id: 'myChipGroup',
    overflowMode: 'popover',
  },
  render: args => <ChipGroupStory {...args} />,
  parameters: {
    docs: {
      source: {
        code: `<ChipGroup
  id="myChipGroup"
  tagSize="small"
  removable
  allowClearAll
  maxTagsToDisplay={0}
  tagsSource={tagsSource}
  label="text"
  overflowMode="popover"
  onDeleteAllClicked={onClearAll}
  onTagsChanged={onTagsChanged}
  onViewMoreClicked={onViewMoreClicked}
  onViewLessClicked={onViewLessClicked}
  onTagDeleted={onTagDeleted}
/>`,
      },
    },
  },
};
