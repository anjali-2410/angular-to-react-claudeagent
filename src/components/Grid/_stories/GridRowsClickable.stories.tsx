import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';

const rowData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  status: ['Active', 'Inactive'][i % 2],
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Status', field: 'status' },
];

const ClickableRowsDemo = () => {
  const [lastClicked, setLastClicked] = useState<string>('None');

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Clickable Rows</h1>
      <p>Last clicked: <strong>{lastClicked}</strong></p>
      <div style={{ height: '320px' }}>
        <Grid
          columnDefs={columnDefs}
          rowData={rowData}
          gridOptions={{
            onRowClicked: (event) => {
              setLastClicked(`Row ${event.data?.id} — ${event.data?.name}`);
            },
          }}
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

export const gridRowsClickable: Story = {
  name: 'Clickable Rows',
  render: () => <ClickableRowsDemo />,
};
