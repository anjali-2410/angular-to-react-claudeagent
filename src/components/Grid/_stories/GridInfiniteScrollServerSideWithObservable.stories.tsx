import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IServerSideGetRowsParams, ColDef } from 'ag-grid-community';
import { of, delay } from 'rxjs';
import { Grid } from '../Grid';
import { ICompatibleServerSideDatasource } from '../types';

const DATA = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  name: `Server Row ${i + 1}`,
  category: ['A', 'B', 'C'][i % 3],
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Category', field: 'category', width: 100 },
];

const ServerSideObservableDemo = () => {
  const dataSource: ICompatibleServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      const { startRow, endRow } = params.request;
      const rows = DATA.slice(startRow, endRow);
      const lastRow = DATA.length <= (endRow || 0) ? DATA.length : -1;
      return of(null).pipe(delay(400)).subscribe(() => {
        params.success({ rowData: rows, rowCount: lastRow });
      }) as any;
    },
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Server Side Infinite Scroll with Observable</h1>
      <div style={{ height: '350px' }}>
        <Grid
          columnDefs={columnDefs}
          gridOptions={{ rowModelType: 'serverSide', cacheBlockSize: 10 }}
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

export const gridScrollRowModelTypeServerSideWithObservable: Story = {
  name: 'Infinite Scroll — Server Side with Observable',
  render: () => <ServerSideObservableDemo />,
};
