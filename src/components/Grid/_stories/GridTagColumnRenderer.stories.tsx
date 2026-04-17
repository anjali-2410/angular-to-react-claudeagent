import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Grid } from '../Grid';

interface TagCellRendererProps extends ICellRendererParams {
  value: string[];
}

const TagCellRenderer: React.FC<TagCellRendererProps> = ({ value }) => {
  if (!Array.isArray(value)) return <span>{String(value)}</span>;
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '4px 0' }}>
      {value.map((tag, i) => (
        <span
          key={i}
          style={{
            background: 'var(--sol-color-background-selected, #e8f0fe)',
            color: 'var(--sol-color-text-default)',
            borderRadius: 'var(--sol-size-radius-sm, 4px)',
            padding: '2px 8px',
            fontSize: 'var(--sol-typography-body-sm-font-size)',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

const rowData = [
  { name: 'Item A', tags: ['React', 'TypeScript', 'UI'] },
  { name: 'Item B', tags: ['Angular', 'RxJS'] },
  { name: 'Item C', tags: ['Vue', 'Composition API', 'Vite'] },
  { name: 'Item D', tags: ['Svelte'] },
  { name: 'Item E', tags: ['Next.js', 'SSR', 'React'] },
];

const columnDefs: ColDef[] = [
  { headerName: 'Name', field: 'name', width: 150 },
  { headerName: 'Tags', field: 'tags', cellRenderer: TagCellRenderer, sortable: false, flex: 1 },
];

const TagColumnDemo = () => (
  <div style={{ height: '400px', padding: '16px' }}>
    <h1>Grid — Tag Column Renderer</h1>
    <div style={{ height: '350px' }}>
      <Grid columnDefs={columnDefs} rowData={rowData} />
    </div>
  </div>
);

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid/Examples',
  component: Grid,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

export const tagColumnRenderer: Story = {
  name: 'Tag Column Renderer',
  render: () => <TagColumnDemo />,
};
