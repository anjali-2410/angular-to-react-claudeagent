import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef, GridApi, GridReadyEvent, ColumnResizedEvent } from 'ag-grid-community';
import { Grid } from '../Grid';

const sampleData = Array.from({ length: 14 }, (_, i) => ({
  policyID: 486 + i,
  policyName: `Rule ${i + 1}`,
  priority: `P${i + 1}`,
  from: '2017-04-03T12:15:57.361',
  to: '2017-04-03T12:15:57.362',
  lastModified: '2017-05-10T10:34:01.507',
  status: ['Draft', 'Active', 'Expired', 'Failed', 'New', 'Running', 'Pending'][i % 7],
  actionReason: 'My Reason',
  actionType: `Extend ${i + 1}`,
}));

const columnDefs: ColDef[] = [
  {
    headerName: 'select',
    headerCheckboxSelection: true,
    checkboxSelection: true,
    maxWidth: 42,
    minWidth: 42,
    headerClass: 'checkbox-class',
    cellClass: 'checkbox-class',
    suppressSizeToFit: true,
    sortable: false,
  },
  { headerName: 'PRIORITY', field: 'priority', lockPinned: true, suppressSizeToFit: true, tooltipField: 'priority' },
  { headerName: 'TYPE', field: 'actionType', lockPinned: true, suppressSizeToFit: true },
  { headerName: 'POLICY NAME', field: 'policyName', lockPinned: true, suppressSizeToFit: true, tooltipField: 'policyName' },
  { headerName: 'FROM', field: 'from', lockPinned: true, suppressSizeToFit: true },
  { headerName: 'TO', field: 'to', lockPinned: true, suppressSizeToFit: true },
  { headerName: 'LAST MODIFIED', field: 'lastModified', lockPinned: true, suppressSizeToFit: true },
  { headerName: 'STATUS', field: 'status', suppressSizeToFit: true, lockPinned: true },
  { headerName: 'REASON', field: 'actionReason', pinned: 'right', width: 130, suppressSizeToFit: true, resizable: false },
];

const GridWithPaginationDemo = (args: any) => {
  const [customPageNumber, setCustomPageNumber] = useState(1);
  const [rangeOfDisplayedItems, setRangeOfDisplayedItems] = useState('0 - 0 of 0 items');
  const gridApiRef = React.useRef<GridApi | null>(null);
  const pageSize = 6;

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
  }, []);

  const onColumnResized = useCallback((event: ColumnResizedEvent) => {
    if (event?.column && event.finished && event.source === 'uiColumnDragged') {
      event.api.sizeColumnsToFit();
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <header><h1>Grid</h1></header>
      <div style={{ marginBottom: '16px' }}>
        <p>Grid With Pagination — Set Custom Page Number from Code:</p>
        <div style={{ padding: '10px' }}>
          <span>Current Page Number: {customPageNumber}</span>
          <br />
          <button style={{ margin: '5px' }} onClick={() => setCustomPageNumber((p) => Math.max(1, p - 1))}>Page Number --</button>
          <button style={{ margin: '5px' }} onClick={() => setCustomPageNumber((p) => p + 1)}>Page Number ++</button>
        </div>
      </div>
      <div style={{ height: '400px' }}>
        <Grid
          columnDefs={columnDefs}
          rowData={sampleData}
          gridOptions={{
            rowSelection: 'multiple',
            onGridReady,
            onColumnResized,
          }}
          pagination={true}
          pageNumber={customPageNumber}
          maxItemsPerPage={pageSize}
          rangeOfDisplayedItems={rangeOfDisplayedItems}
          onChangePageClick={args.onChangePageClick}
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

export const gridWithPagination: Story = {
  name: 'Grid With Pagination',
  render: (args) => <GridWithPaginationDemo {...args} />,
  args: {
    onChangePageClick: (page: number) => console.log('changePageClick', page),
  },
};
