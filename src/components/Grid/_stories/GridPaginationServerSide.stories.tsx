import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IServerSideDatasource, IServerSideGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';
import { GridOptionsCellSpinnerProp } from '../types';

const DATA = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: Math.round(Math.random() * 1000),
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Value', field: 'value' },
];

const PaginationServerSideDemo = () => {
  const dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      setTimeout(() => {
        const { startRow, endRow } = params.request;
        const rows = DATA.slice(startRow, endRow);
        params.success({ rowData: rows, rowCount: DATA.length });
      }, 400);
    },
  };

  const gridOptions: GridOptionsCellSpinnerProp = {
    rowModelType: 'serverSide',
    cacheBlockSize: 10,
  };

  return (
    <div style={{ height: '500px', padding: '16px' }}>
      <h1>Grid — Pagination with Server Side Row Model</h1>
      <div style={{ height: '450px' }}>
        <Grid
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          dataSource={dataSource}
          pagination={true}
          maxItemsPerPage={10}
          maxAmountOfPages={10}
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

export const paginationRowModelTypeServerSide: Story = {
  name: 'Pagination — Server Side Row Model',
  render: () => <PaginationServerSideDemo />,
};
