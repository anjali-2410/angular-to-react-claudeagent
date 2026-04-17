import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IServerSideDatasource, IServerSideGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';
import { NoResultsOverlay } from '../NoResultsOverlay';
import { GridOptionsCellSpinnerProp } from '../types';

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id' },
  { headerName: 'Name', field: 'name' },
];

const EmptyGridDemo = () => {
  const dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      setTimeout(() => {
        params.success({ rowData: [], rowCount: 0 });
      }, 500);
    },
  };

  const gridOptions: GridOptionsCellSpinnerProp = {
    rowModelType: 'serverSide',
    noRowsOverlayComponent: NoResultsOverlay,
    noRowsOverlayComponentParams: { message: 'No data available' },
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Empty Server Side</h1>
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

export const emptyGridServerSide: Story = {
  name: 'Empty Grid — Server Side',
  render: () => <EmptyGridDemo />,
};
