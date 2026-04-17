import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';

const rowData = Array.from({ length: 8 }, (_, i) => ({
  name: `Item ${i + 1}`,
  category: ['Alpha', 'Beta', 'Gamma'][i % 3],
  value: (i + 1) * 100,
}));

const columnDefs: ColDef[] = [
  { headerName: 'Name', field: 'name' },
  { headerName: 'Category', field: 'category' },
  { headerName: 'Value', field: 'value', type: 'numericColumn' },
];

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid/Overview',
  component: Grid,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

export const gridOverview: Story = {
  name: 'Grid Overview',
  render: () => (
    <div style={{ height: '400px', padding: '16px' }}>
      <div style={{ height: '360px' }}>
        <Grid columnDefs={columnDefs} rowData={rowData} />
      </div>
    </div>
  ),
};
