import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IGetRowsParams, ColDef } from 'ag-grid-community';
import { of, delay } from 'rxjs';
import { Grid } from '../Grid';
import { ICompatibleDatasource } from '../types';

const DATA = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  name: `Observable Row ${i + 1}`,
  type: ['TypeA', 'TypeB'][i % 2],
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Type', field: 'type', width: 100 },
];

const ObservableInfiniteDemo = () => {
  const dataSource: ICompatibleDatasource = {
    getRows: (params: IGetRowsParams) => {
      const rows = DATA.slice(params.startRow, params.endRow);
      const lastRow = DATA.length <= params.endRow ? DATA.length : -1;
      return of(null).pipe(delay(300)).subscribe(() => {
        params.successCallback(rows, lastRow);
      }) as any;
    },
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Infinite Scroll with Observable Datasource</h1>
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

export const gridScrollRowModelTypeInfiniteWithObservable: Story = {
  name: 'Infinite Scroll — Observable Datasource',
  render: () => <ObservableInfiniteDemo />,
};
