'use client';

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';
import { GridPagination } from './GridPagination';
import { ColDef } from 'ag-grid-community';

vi.mock('ag-grid-react', () => ({
  AgGridReact: vi.fn(({ className }: any) => (
    <div data-testid="ag-grid" className={className} />
  )),
}));

const sampleColumnDefs: ColDef[] = [
  { headerName: 'Name', field: 'name' },
  { headerName: 'Age', field: 'age' },
];

const sampleRowData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('Grid', () => {
  it('renders without crashing', () => {
    render(<Grid columnDefs={sampleColumnDefs} rowData={sampleRowData} />);
    expect(screen.getByTestId('ag-grid')).toBeDefined();
  });

  it('renders ag-theme-balham class', () => {
    render(<Grid columnDefs={sampleColumnDefs} rowData={sampleRowData} />);
    const grid = screen.getByTestId('ag-grid');
    expect(grid.className).toContain('ag-theme-balham');
  });

  it('adds sol-grid-with-pagination class when pagination is enabled', () => {
    render(
      <Grid
        columnDefs={sampleColumnDefs}
        rowData={sampleRowData}
        pagination={true}
        maxItemsPerPage={10}
      />
    );
    const grid = screen.getByTestId('ag-grid');
    expect(grid.className).toContain('sol-grid-with-pagination');
  });

  it('renders pagination bar when pagination prop is true', () => {
    render(
      <Grid
        columnDefs={sampleColumnDefs}
        rowData={sampleRowData}
        pagination={true}
        maxItemsPerPage={5}
      />
    );
    expect(screen.getByRole('navigation')).toBeDefined();
  });

  it('does not render pagination bar when pagination is false', () => {
    render(<Grid columnDefs={sampleColumnDefs} rowData={sampleRowData} pagination={false} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('renders accessibility announcement divs', () => {
    render(<Grid columnDefs={sampleColumnDefs} rowData={sampleRowData} />);
    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the sol-grid wrapper', () => {
    const { container } = render(<Grid columnDefs={sampleColumnDefs} rowData={sampleRowData} />);
    expect(container.querySelector('.sol-grid')).toBeDefined();
  });
});

describe('GridPagination', () => {
  const baseProps = {
    pageNumber: 1,
    totalNoOfPagesInGrid: 10,
  };

  it('renders navigation with correct aria-label', () => {
    render(<GridPagination {...baseProps} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeDefined();
  });

  it('renders page number input', () => {
    render(<GridPagination {...baseProps} />);
    expect(screen.getByRole('spinbutton')).toBeDefined();
  });

  it('disables prev buttons when prevIconDisabled is true', () => {
    render(<GridPagination {...baseProps} prevIconDisabled={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0].hasAttribute('disabled')).toBe(true);
    expect(buttons[1].hasAttribute('disabled')).toBe(true);
  });

  it('disables next buttons when nextIconDisabled is true', () => {
    render(<GridPagination {...baseProps} nextIconDisabled={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2].hasAttribute('disabled')).toBe(true);
    expect(buttons[3].hasAttribute('disabled')).toBe(true);
  });

  it('shows range of displayed items', () => {
    render(<GridPagination {...baseProps} rangeOfDisplayedItems="1 - 10 of 100" />);
    expect(screen.getByText('1 - 10 of 100')).toBeDefined();
  });

  it('fires onFirstPageClick when first page button clicked', async () => {
    const onFirstPageClick = vi.fn();
    render(<GridPagination {...baseProps} onFirstPageClick={onFirstPageClick} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].click();
    expect(onFirstPageClick).toHaveBeenCalledWith(1);
  });

  it('fires onLastPageClick when last page button clicked', async () => {
    const onLastPageClick = vi.fn();
    render(<GridPagination {...baseProps} onLastPageClick={onLastPageClick} />);
    const buttons = screen.getAllByRole('button');
    buttons[3].click();
    expect(onLastPageClick).toHaveBeenCalledWith(10);
  });

  it('applies custom i18n labels', () => {
    render(
      <GridPagination
        {...baseProps}
        i18n={{ paginationNavigationLabel: 'Custom Nav', goToFirstPage: 'First' }}
      />
    );
    expect(screen.getByRole('navigation', { name: 'Custom Nav' })).toBeDefined();
    expect(screen.getByTitle('First')).toBeDefined();
  });
});
