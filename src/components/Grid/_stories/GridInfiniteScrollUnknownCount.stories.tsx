import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IDatasource, IGetRowsParams, ColDef } from 'ag-grid-community';
import { Grid } from '../Grid';

const TOTAL = 500;
const DATA = Array.from({ length: TOTAL }, (_, i) => ({
  id: i + 1,
  name: `Row ${i + 1}`,
  value: Math.round(Math.random() * 100),
}));

const columnDefs: ColDef[] = [
  { headerName: 'ID', field: 'id', width: 80 },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Value', field: 'value' },
];

const UnknownCountDemo = () => {
  const dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      setTimeout(() => {
        const rows = DATA.slice(params.startRow, params.endRow);
        // Pass -1 to indicate unknown total (more rows exist)
        const lastRow = params.endRow >= TOTAL ? TOTAL : -1;
        params.successCallback(rows, lastRow);
      }, 300);
    },
  };

  return (
    <div style={{ height: '400px', padding: '16px' }}>
      <h1>Grid — Infinite Scroll (Unknown Row Count)</h1>
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

export const infiniteScrollUnknownCount: Story = {
  name: 'Infinite Scroll — Unknown Row Count',
  render: () => <UnknownCountDemo />,
};
