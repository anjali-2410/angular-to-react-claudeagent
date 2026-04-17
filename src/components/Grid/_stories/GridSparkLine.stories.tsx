import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Grid } from '../Grid';

const SparklineCellRenderer: React.FC<ICellRendererParams> = ({ value }) => {
  if (!Array.isArray(value)) return <span>{value}</span>;
  const max = Math.max(...value);
  return (
    <svg width="80" height="24" aria-label={`Trend: ${value.join(', ')}`}>
      {value.map((v: number, i: number) => (
        <rect
          key={i}
          x={i * (80 / value.length)}
          y={24 - (v / max) * 24}
          width={80 / value.length - 1}
          height={(v / max) * 24}
          fill="var(--sol-color-border-focus-default, #0070d2)"
        />
      ))}
    </svg>
  );
};

const rowData = Array.from({ length: 8 }, (_, i) => ({
  name: `Series ${i + 1}`,
  trend: Array.from({ length: 6 }, () => Math.round(Math.random() * 100)),
  total: Math.round(Math.random() * 1000),
}));

const columnDefs: ColDef[] = [
  { headerName: 'Name', field: 'name' },
  { headerName: 'Trend', field: 'trend', cellRenderer: SparklineCellRenderer, sortable: false },
  { headerName: 'Total', field: 'total' },
];

const SparkLineDemo = () => (
  <div style={{ height: '400px', padding: '16px' }}>
    <h1>Grid — Spark Line Cell Renderer</h1>
    <div style={{ height: '350px' }}>
      <Grid columnDefs={columnDefs} rowData={rowData} />
    </div>
  </div>
);

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid/Examples',
  component: Grid,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

export const sparkLineCellRenderer: Story = {
  name: 'Spark Line Cell Renderer',
  render: () => <SparkLineDemo />,
};
