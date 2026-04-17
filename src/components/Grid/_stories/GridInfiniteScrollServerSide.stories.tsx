import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IServerSideDatasource, IServerSideGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';
import { GridOptionsCellSpinnerProp } from '../types';

const DATA = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  category: ['A', 'B', 'C'][i % 3],
  value: Math.round(Math.random() * 1000),
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Category', field: 'category', width: 100 },
  { headerName: 'Value', field: 'value', width: 100 },
];

const ServerSideDemo = () => {
  const dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      setTimeout(() => {
        const { startRow, endRow } = params.request;
        const rows = DATA.slice(startRow, endRow);
        const lastRow = DATA.length <= (endRow || 0) ? DATA.length : -1;
        params.success({ rowData: rows, rowCount: lastRow });
      }, 500);
    },
  };

  const gridOptions: GridOptionsCellSpinnerProp = {
    rowModelType: 'serverSide',
    cacheBlockSize: 10,
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Infinite Scroll (Server Side)</h1>
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

export const gridScrollRowModelTypeServerSide: Story = {
  name: 'Infinite Scroll — Server Side Row Model',
  render: () => <ServerSideDemo />,
};
