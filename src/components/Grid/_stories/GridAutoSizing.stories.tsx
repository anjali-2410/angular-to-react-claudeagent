import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Grid } from '../Grid';

const rowData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  shortText: `Item ${i + 1}`,
  longText: `This is a longer description for row ${i + 1} that may need auto-sizing`,
  number: Math.round(Math.random() * 10000),
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 60 },
  { headerName: 'Short Text', field: 'shortText' },
  { headerName: 'Long Text', field: 'longText' },
  { headerName: 'Number', field: 'number', type: 'numericColumn' },
];

const AutoSizingDemo = () => {
  const onGridReady = (params: GridReadyEvent) => {
    params.api.autoSizeAllColumns();
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Auto-Sizing Columns</h1>
      <div style={{ height: '350px' }}>
        <Grid
          columnDefs={columnDefs}
          rowData={rowData}
          gridOptions={{ onGridReady }}
        />
      </div>
    </div>
  );
};

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid/Examples',
  component: Grid,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

export const autoSizingColumns: Story = {
  name: 'Auto-Sizing Columns',
  render: () => <AutoSizingDemo />,
};
