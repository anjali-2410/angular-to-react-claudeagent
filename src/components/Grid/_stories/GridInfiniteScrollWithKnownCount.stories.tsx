import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IDatasource, IGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';

const TOTAL = 150;
const DATA = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  status: ['Active', 'Inactive', 'Pending'][i % 3],
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Status', field: 'status', width: 120 },
];

const KnownCountDemo = () => {
  const dataSource: IDatasource = {
    rowCount: TOTAL,
    getRows: (params: IGetRowsParams) => {
      setTimeout(() => {
        const rows = DATA.slice(params.startRow, params.endRow);
        params.successCallback(rows, TOTAL);
      }, 300);
    },
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Infinite Scroll (Known Row Count)</h1>
      <div style={{ height: '350px' }}>
        <Grid
          columnDefs={columnDefs}
          gridOptions={{ rowModelType: 'infinite', cacheBlockSize: 20 }}
          dataSource={dataSource}
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

export const infiniteScrollWithKnownCount: Story = {
  name: 'Infinite Scroll — Known Row Count',
  render: () => <KnownCountDemo />,
};
