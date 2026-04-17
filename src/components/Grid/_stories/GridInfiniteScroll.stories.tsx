import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IDatasource, IGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';
import { GridOptionsCellSpinnerProp } from '../types';

const DATA = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Row ${i + 1}`,
  status: ['Active', 'Inactive', 'Pending'][i % 3],
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Status', field: 'status', width: 120 },
];

const InfiniteScrollDemo = () => {
  const dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      setTimeout(() => {
        const rows = DATA.slice(params.startRow, params.endRow);
        const lastRow = DATA.length <= params.endRow ? DATA.length : -1;
        params.successCallback(rows, lastRow);
      }, 300);
    },
  };

  const gridOptions: GridOptionsCellSpinnerProp = {
    rowModelType: 'infinite',
    cacheBlockSize: 20,
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Infinite Scroll (Infinite Row Model)</h1>
      <div style={{ height: '350px' }}>
        <Grid columnDefs={columnDefs} gridOptions={gridOptions} dataSource={dataSource} />
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

export const gridScrollRowModelTypeInfinite: Story = {
  name: 'Infinite Scroll — Infinite Row Model',
  render: () => <InfiniteScrollDemo />,
};
