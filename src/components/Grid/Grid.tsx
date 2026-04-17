'use client';

import React, {
  useId,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ColGroupDef,
  ColumnState,
  DragStoppedEvent,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IServerSideDatasource,
  RowModelType,
  SortChangedEvent,
} from 'ag-grid-community';
import { suppressKeyboardEvent } from './keyboardCellNavigation';
import { GridOptionsCellSpinnerProp, ICompatibleDatasource, ICompatibleServerSideDatasource, DEFAULT_I18N, GridI18n } from './types';
import { GridEventUtils } from './gridEventUtils';
import { RootCellRender } from './RootCellRender';
import { CellWithSpinnerRender } from './CellWithSpinnerRender';
import { SpinnerRender } from './SpinnerRender';
import { RowWithSpinnerRender } from './RowWithSpinnerRender';
import { GridPagination } from './GridPagination';
import './Grid.css';

export interface GridProps {
  dataSource?: IDatasource | ICompatibleDatasource | IServerSideDatasource | ICompatibleServerSideDatasource;
  maxAmountOfPages?: number;
  rangeOfDisplayedItems?: string;
  columnDefs?: (ColDef | ColGroupDef)[] | null;
  defaultColDef?: ColDef;
  rowData?: any[];
  gridOptions?: GridOptionsCellSpinnerProp;
  ariaLabel?: string;
  ariaLabelledby?: string | null;
  pagination?: boolean;
  maxItemsPerPage?: number;
  gridState?: unknown;
  gridSort?: ColumnState[] | any;
  frameworkComponents?: any;
  pageNumber?: number;
  selectRowEnabled?: boolean;
  i18n?: GridI18n;
  onChangePageClick?: (page: number) => void;
  onSaveState?: (state: ColumnState[]) => void;
  onSaveSort?: (sort: ColumnState[]) => void;
}

function checkRowModel(rowModelType: RowModelType | undefined): boolean {
  return rowModelType === 'viewport' || rowModelType === 'infinite' || rowModelType === 'serverSide';
}

export const Grid: React.FC<GridProps> = ({
  dataSource,
  maxAmountOfPages,
  rangeOfDisplayedItems: rangeOfDisplayedItemsProp,
  columnDefs,
  defaultColDef: defaultColDefProp,
  rowData,
  gridOptions,
  ariaLabel = '',
  ariaLabelledby = null,
  pagination,
  maxItemsPerPage,
  gridState,
  gridSort,
  frameworkComponents,
  pageNumber: pageNumberProp = 0,
  selectRowEnabled = true,
  i18n = {},
  onChangePageClick,
  onSaveState,
  onSaveSort,
}) => {
  const t = useMemo(() => ({ ...DEFAULT_I18N, ...i18n }), [i18n]);
  const uid = useId();
  const uniqueGridId = uid.replace(/:/g, '');
  const gridRef = useRef<AgGridReact>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const headerSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRowElementRef = useRef<any>(null);
  const isInitialDataLoadRef = useRef(true);
  const actualColumnWeAreResizingRef = useRef<any>(null);

  const [gridDataReady] = useState(true);
  const [gridReady, setGridReady] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [totalNoOfPages, setTotalNoOfPages] = useState(0);
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [pageFirstRowIndex, setPageFirstRowIndex] = useState(-1);
  const [pageLastRowIndex, setPageLastRowIndex] = useState(-1);
  const [prevIconDisabled, setPrevIconDisabled] = useState(true);
  const [nextIconDisabled, setNextIconDisabled] = useState(true);
  const [computedRange, setComputedRange] = useState('');
  const [gridStatusAnnouncement, setGridStatusAnnouncement] = useState('');
  const [selectionAnnouncement, setSelectionAnnouncement] = useState('');

  const sortableColumnAnnouncement = t.gridSortableColumn;

  // Navigate to page when pageNumberProp changes
  useEffect(() => {
    const pageNum = pageNumberProp - 1;
    if (pagination && gridApiRef.current && pageNum >= 0) {
      gridApiRef.current.paginationGoToPage(pageNum);
    }
  }, [pageNumberProp, pagination]);

  const scheduleHeaderAccessibilitySync = useCallback(() => {
    if (headerSyncTimerRef.current !== null) {
      clearTimeout(headerSyncTimerRef.current);
    }
    headerSyncTimerRef.current = setTimeout(() => {
      headerSyncTimerRef.current = null;
      syncSortableHeaderAccessibility();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncSortableHeaderAccessibility = useCallback(() => {
    const api = gridApiRef.current;
    if (!api || typeof api.getColumnState !== 'function' || typeof api.getColumnDef !== 'function') return;

    const sortableDescriptionId = `sol-grid-${uniqueGridId}-sortable`;
    const columnStates = api.getColumnState();
    const container = containerRef.current;
    if (!container) return;

    const headerCells = container.querySelectorAll<HTMLElement>('.ag-header-cell[col-id][role="columnheader"]');
    headerCells.forEach((headerCell) => {
      const colId = headerCell.getAttribute('col-id');
      if (!colId) return;

      const colDef = api.getColumnDef(colId) as ColDef | undefined;
      const isHeaderMarkedSortable = headerCell.classList.contains('ag-header-cell-sortable');
      const isHeaderSelectionControl = Boolean(colDef?.headerCheckboxSelection) || Boolean(colDef?.checkboxSelection);
      const isSortableFromConfig =
        colDef?.sortable ??
        gridOptions?.defaultColDef?.sortable ??
        true;
      const isSortable = isHeaderMarkedSortable && isSortableFromConfig && !isHeaderSelectionControl;

      if (!isSortable) {
        headerCell.removeAttribute('aria-sort');
        updateAriaDescribedBy(headerCell, sortableDescriptionId, false);
        return;
      }

      const sortState = columnStates.find((cs) => cs.colId === colId)?.sort;
      const ariaSort = sortState === 'asc' ? 'ascending' : sortState === 'desc' ? 'descending' : 'none';
      headerCell.setAttribute('aria-sort', ariaSort);
      updateAriaDescribedBy(headerCell, sortableDescriptionId, ariaSort === 'none');
    });
  }, [uniqueGridId, gridOptions]);

  function updateAriaDescribedBy(element: HTMLElement, id: string, include: boolean) {
    const existing = element.getAttribute('aria-describedby') || '';
    const tokens = new Set(existing.split(/\s+/).filter(Boolean));
    include ? tokens.add(id) : tokens.delete(id);
    if (tokens.size === 0) {
      element.removeAttribute('aria-describedby');
    } else {
      element.setAttribute('aria-describedby', Array.from(tokens).join(' '));
    }
  }

  const applyGridAccessibleName = useCallback(
    (api: GridApi) => {
      const lb = ariaLabelledby?.trim();
      if (lb) {
        api.setGridAriaProperty('labelledby', lb);
        return;
      }
      const label = ariaLabel.trim();
      if (label) api.setGridAriaProperty('label', label);
    },
    [ariaLabel, ariaLabelledby]
  );

  const selectRow = useCallback((rowElement: any) => {
    if (selectedRowElementRef.current !== rowElement) {
      if (selectedRowElementRef.current) {
        selectedRowElementRef.current.classList.remove('sol-selected-row');
      }
      selectedRowElementRef.current = rowElement;
      if (rowElement) rowElement.classList.add('sol-selected-row');
    }
  }, []);

  const changeFromToOnPagechange = useCallback(() => {
    const api = gridApiRef.current;
    if (api && typeof api.isDestroyed === 'function' && !api.isDestroyed()) {
      const totalPages = maxAmountOfPages || api.paginationGetTotalPages();
      const currentPageIndex = api.paginationGetCurrentPage();
      const lastRow = api.getLastDisplayedRow();
      const firstRow = api.getFirstDisplayedRow();
      const rowCount = api.getDisplayedRowCount();

      let currentPage: number;
      if (totalPages === 0) {
        currentPage = 0;
        setPageFirstRowIndex(-1);
      } else {
        currentPage = currentPageIndex + 1;
        setPageFirstRowIndex(firstRow);
      }

      setTotalNoOfPages(totalPages);
      setCurrentPageNumber(currentPage);
      setPageLastRowIndex(lastRow);
      setTotalRowsCount(rowCount);
      setPrevIconDisabled(currentPage <= 1);
      setNextIconDisabled(currentPage === totalPages);

      const rangeStr = `${t.rangeOfDisplayedItems(firstRow + 1, lastRow + 1, rowCount)} ${t.segmentsLabel}`;
      setComputedRange(rangeStr);

      if (totalPages === 0) {
        setGridStatusAnnouncement('');
      } else {
        const f = firstRow + 1;
        const l = Math.min(lastRow + 1, rowCount);
        setGridStatusAnnouncement(t.gridPaginationStatus(currentPage, totalPages, f, l, rowCount));
      }
    } else {
      setCurrentPageNumber(0);
      setTotalNoOfPages(0);
      setPrevIconDisabled(true);
      setNextIconDisabled(true);
      setTotalRowsCount(0);
      setPageFirstRowIndex(-1);
      setPageLastRowIndex(-1);
      setComputedRange('');
      setGridStatusAnnouncement('');
    }
  }, [maxAmountOfPages, t]);

  const buildExtendedOptions = useCallback((): GridOptionsCellSpinnerProp => {
    const baseOpt: GridOptionsCellSpinnerProp = {
      rowBuffer: 50,
      maxConcurrentDatasourceRequests: 1,
      maxBlocksInCache: 0,
      loadingCellRenderer: RowWithSpinnerRender,
      cellRenderer: CellWithSpinnerRender,
      loadingOverlayComponent: SpinnerRender,
      headerHeight: 44,
      rowHeight: 36,
      animateRows: true,
      rowSelection: 'multiple',
      suppressContextMenu: true,
      suppressDragLeaveHidesColumns: true,
      suppressCellFocus: false,
      suppressRowClickSelection: true,
      suppressColumnVirtualisation: true,
      tooltipShowDelay: 3000,
      ensureDomOrder: true,
      sortingOrder: ['desc', 'asc', null],
      defaultColDef: { sortable: true, resizable: true, suppressMenu: true, suppressKeyboardEvent },
      overlayNoRowsTemplate: t.noResult,
    };

    if (gridOptions && !gridOptions.cellRenderer) {
      gridOptions.cellRenderer = baseOpt.cellRenderer;
    }

    const merged: GridOptionsCellSpinnerProp = Object.assign({}, baseOpt, gridOptions);
    if (gridOptions?.defaultColDef) {
      merged.defaultColDef = Object.assign({}, baseOpt.defaultColDef, gridOptions.defaultColDef);
    }

    merged.ensureDomOrder = true;
    merged.suppressColumnVirtualisation = true;
    merged.suppressCellFocus = false;

    // Detail row height
    if (merged.detailCellRendererParams) {
      const dg = merged.detailCellRendererParams.detailGridOptions;
      merged.detailCellRendererParams.detailGridOptions = Object.assign({ rowHeight: 36 }, dg || {});
    }

    // Add clickable class
    if (typeof merged.onRowClicked === 'function') {
      merged.rowClass = 'clickable';
    } else if (columnDefs) {
      (columnDefs as ColDef[]).forEach((colDef: ColDef) => {
        if (typeof colDef.onCellClicked === 'function') {
          colDef.cellClass = 'clickable';
        }
      });
    }

    // Wrap onGridReady
    const consumerOnGridReady = merged.onGridReady;
    const consumerOnSortChanged = merged.onSortChanged;
    const consumerOnFirstDataRendered = merged.onFirstDataRendered;
    const consumerOnSelectionChanged = merged.onSelectionChanged;

    merged.onGridReady = (params: GridReadyEvent) => {
      handleGridReady(params);
      consumerOnGridReady?.call(merged.context || merged, params);
    };

    merged.onFirstDataRendered = (params: FirstDataRenderedEvent) => {
      handleFirstDataRendered(params);
      consumerOnFirstDataRendered?.call(merged.context || merged, params);
    };

    merged.onSortChanged = (params: SortChangedEvent<unknown>) => {
      handleSortChange(params);
      consumerOnSortChanged?.call(merged.context || merged, params);
    };

    merged.onSelectionChanged = (params: any) => {
      handleSelectionChanged(params);
      consumerOnSelectionChanged?.call(merged.context || merged, params);
    };

    // Row click with selection
    if (selectRowEnabled) {
      const onRowClickedCallback = merged.onRowClicked;
      merged.onRowClicked = (event: any) => {
        const rowElement = event.event?.target?.closest?.('.ag-row');
        selectRow(rowElement);
        onRowClickedCallback?.(event);
      };
    }

    // Server-side datasource patch
    if (merged && checkRowModel(merged.rowModelType) && !dataSource) {
      merged.onGridReady = GridEventUtils.toPatchSuccessCallback(gridOptions || {}).onGridReady;
      // Re-wrap after patch to still call our internal handler
      const patchedOnGridReady = merged.onGridReady;
      merged.onGridReady = (params: GridReadyEvent) => {
        handleGridReady(params);
        patchedOnGridReady?.(params);
      };
    }

    return merged;
  }, [gridOptions, columnDefs, dataSource, selectRowEnabled, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      if (!params?.api) throw new Error('There was a problem initializing the grid.');
      gridApiRef.current = params.api;
      params.api.applyColumnState({ state: gridSort, applyOrder: true });

      if (gridState && (params.api as any).columnApi) {
        (params.api as any).columnApi.applyColumnState(gridState);
      }

      setGridReady(true);
      setCurrentPageNumber(1);

      const statusId = `sol-grid-${uniqueGridId}-status`;
      params.api.setGridAriaProperty('describedby', statusId);
      scheduleHeaderAccessibilitySync();
      applyGridAccessibleName(params.api);

      const isNonClientSide = checkRowModel(gridOptions?.rowModelType) || dataSource;
      if (isNonClientSide) {
        setGridStatusAnnouncement(t.gridReadyLoadingData);
      } else {
        const rowCount = params.api.getDisplayedRowCount();
        setGridStatusAnnouncement(t.gridLoadedWithRows(rowCount));
      }

      if (dataSource || (gridOptions && checkRowModel(gridOptions.rowModelType))) {
        GridEventUtils.onGridReady(params, dataSource || null, gridOptions || {});
      }

      if (gridOptions?.rowModelType === 'infinite') {
        GridEventUtils.toConfigureColumns(params, gridOptions || {}, RootCellRender);
      }

      if (pagination) changeFromToOnPagechange();
    },
    [gridSort, gridState, uniqueGridId, gridOptions, dataSource, pagination, t,
     scheduleHeaderAccessibilitySync, applyGridAccessibleName, changeFromToOnPagechange]
  );

  const handleFirstDataRendered = useCallback(
    (params: FirstDataRenderedEvent) => {
      const isInfiniteScroll = gridOptions?.rowModelType === 'infinite';
      if (isInitialDataLoadRef.current && !isInfiniteScroll && (checkRowModel(gridOptions?.rowModelType) || dataSource)) {
        const rowCount = params.api.getDisplayedRowCount();
        setGridStatusAnnouncement(t.gridLoadedWithRows(rowCount));
        isInitialDataLoadRef.current = false;
      }
      scheduleHeaderAccessibilitySync();
    },
    [gridOptions, dataSource, t, scheduleHeaderAccessibilitySync]
  );

  const handleSortChange = useCallback(
    (params: SortChangedEvent<unknown>) => {
      if (gridApiRef.current && onSaveSort) {
        const sort = gridApiRef.current.getColumnState();
        onSaveSort(sort);
      }

      if (params.api) {
        const sortModel = params.api.getColumnState().filter((col) => col.sort != null);
        if (sortModel.length > 0) {
          const sortedColumn = sortModel[0];
          const colDef = params.api.getColumnDef(sortedColumn.colId);
          const columnName = colDef?.headerName || sortedColumn.colId;
          const sortDirection = sortedColumn.sort === 'asc' ? t.gridSortAscending : t.gridSortDescending;
          setGridStatusAnnouncement(t.gridSortedBy(columnName!, sortDirection));
        } else {
          const rowCount = params.api.getDisplayedRowCount();
          setGridStatusAnnouncement(t.gridSortCleared(rowCount));
        }
      }

      scheduleHeaderAccessibilitySync();

      if (dataSource || (gridOptions && checkRowModel(gridOptions.rowModelType))) {
        GridEventUtils.onSortChanged(params);
      }
    },
    [onSaveSort, dataSource, gridOptions, t, scheduleHeaderAccessibilitySync]
  );

  const handleSelectionChanged = useCallback(
    (params: any) => {
      if (!params?.api) return;
      const count = params.api.getSelectedRows().length;
      setSelectionAnnouncement(count === 0 ? t.gridNoRowsSelected : t.gridRowsSelected(count));
    },
    [t]
  );

  const saveColumnState = useCallback(() => {
    if (gridApiRef.current && onSaveState) {
      const columnState = gridApiRef.current.getColumnState();
      onSaveState(columnState);
    }
  }, [onSaveState]);

  const handleDragStopped = useCallback(
    (params: DragStoppedEvent) => {
      saveColumnState();
      if (gridOptions?.rowModelType === 'infinite') {
        GridEventUtils.onDragStopped(params, gridOptions.cellRenderer, CellWithSpinnerRender);
      }
    },
    [saveColumnState, gridOptions]
  );

  const handleColumnVisible = useCallback(() => {
    saveColumnState();
    scheduleHeaderAccessibilitySync();
  }, [saveColumnState, scheduleHeaderAccessibilitySync]);

  const handleGridColumnChanged = useCallback(() => {
    if (gridReady) saveColumnState();
    scheduleHeaderAccessibilitySync();
  }, [gridReady, saveColumnState, scheduleHeaderAccessibilitySync]);

  const handleColumnResized = useCallback(
    ($event: any) => {
      if (onSaveState) {
        if (!$event.finished) {
          actualColumnWeAreResizingRef.current = $event.column?.colId;
        } else if ($event.column && $event.column.colId === actualColumnWeAreResizingRef.current) {
          saveColumnState();
        }
      }
    },
    [onSaveState, saveColumnState]
  );

  // Accessibility DOM fixes after render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll('.ag-unselectable').forEach((item) => {
      item.removeAttribute('aria-role');
    });

    const api = gridApiRef.current;
    if (api && typeof api.isDestroyed === 'function' && !api.isDestroyed()) {
      container.querySelectorAll<HTMLElement>('.ag-checkbox-input').forEach((checkbox) => {
        const row = checkbox.closest('.ag-row');
        if (!row) return;
        const rowIndex = parseInt((row as HTMLElement).getAttribute('row-index') || '-1', 10);
        if (rowIndex < 0) return;
        const rowNode = api.getDisplayedRowAtIndex(rowIndex);
        if (rowNode?.data) {
          const columns = api.getAllDisplayedColumns();
          let labelValue = '';
          for (const col of columns) {
            const colDef = col.getColDef();
            if (!colDef.checkboxSelection && !colDef.headerCheckboxSelection && colDef.field) {
              labelValue = rowNode.data[colDef.field] ?? '';
              break;
            }
          }
          checkbox.setAttribute('aria-label', `Select ${labelValue || `row ${rowIndex + 1}`}`);
        }
      });
    }

    container.querySelectorAll('.ag-column-drop-empty-message').forEach((item) => {
      item.setAttribute('role', 'option');
    });

    container.querySelector('.ag-root')?.setAttribute('aria-busy', 'true');
  });

  // Set cacheBlockSize on first render after grid is ready
  useEffect(() => {
    if (!gridApiRef.current || !gridOptions) return;
    if (gridOptions.cacheBlockSize || gridOptions.infiniteInitialRowCount) return;

    const container = containerRef.current;
    if (!container) return;
    const viewports = container.querySelectorAll('.ag-body-viewport');
    if (viewports[0]) {
      const viewportHeight = viewports[0].getBoundingClientRect().height;
      const rowCounter = Math.ceil(viewportHeight / 36);
      gridApiRef.current.setGridOption('cacheBlockSize' as any, rowCounter);
      gridApiRef.current.setGridOption('infiniteInitialRowCount' as any, rowCounter);
    }
  }, [gridReady, gridOptions]);

  useEffect(() => {
    return () => {
      if (headerSyncTimerRef.current !== null) {
        clearTimeout(headerSyncTimerRef.current);
      }
    };
  }, []);

  const extendedOptions = useMemo(
    () => buildExtendedOptions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridOptions, columnDefs, selectRowEnabled, dataSource]
  );

  const displayedRange = rangeOfDisplayedItemsProp || computedRange;

  return (
    <div className="sol-grid" ref={containerRef}>
      <div className="grid-announcements" aria-live="polite" aria-atomic="false">
        <div
          className="sol-screenreader-only"
          id={`sol-grid-${uniqueGridId}-status`}
          role="status"
        >
          {gridStatusAnnouncement}
        </div>
        <div
          className="sol-screenreader-only"
          id={`sol-grid-${uniqueGridId}-selection`}
          role="status"
        >
          {selectionAnnouncement}
        </div>
        <div className="sol-screenreader-only" id={`sol-grid-${uniqueGridId}-sortable`}>
          {sortableColumnAnnouncement}
        </div>
      </div>

      {gridDataReady && (
        <>
          <AgGridReact
            ref={gridRef}
            gridOptions={extendedOptions}
            components={frameworkComponents}
            className={`ag-theme-balham${pagination ? ' sol-grid-with-pagination' : ''}`}
            columnDefs={columnDefs ?? undefined}
            defaultColDef={defaultColDefProp}
            rowData={rowData}
            paginationPageSize={maxItemsPerPage}
            pagination={pagination}
            suppressPaginationPanel={true}
            onPaginationChanged={changeFromToOnPagechange}
            onDragStopped={handleDragStopped}
            onColumnVisible={handleColumnVisible}
            onGridColumnsChanged={handleGridColumnChanged}
            onColumnResized={handleColumnResized}
          />

          {pagination && (
            <div className="pagination-bar">
              <GridPagination
                rangeOfDisplayedItems={displayedRange}
                prevIconDisabled={prevIconDisabled}
                nextIconDisabled={nextIconDisabled}
                pageNumber={currentPageNumber}
                totalNoOfPagesInGrid={totalNoOfPages}
                i18n={i18n}
                onLastPageClick={(page) => {
                  gridApiRef.current?.paginationGoToLastPage();
                  if (page !== currentPageNumber) onChangePageClick?.(page);
                }}
                onFirstPageClick={(page) => {
                  gridApiRef.current?.paginationGoToFirstPage();
                  if (page !== currentPageNumber) onChangePageClick?.(page);
                }}
                onBackPageClick={(page) => {
                  gridApiRef.current?.paginationGoToPreviousPage();
                  if (page !== currentPageNumber) onChangePageClick?.(page);
                }}
                onEnterClicked={(page) => {
                  gridApiRef.current?.paginationGoToPage(page - 1);
                  if (page !== currentPageNumber) onChangePageClick?.(page);
                }}
                onNextPageClick={(page) => {
                  gridApiRef.current?.paginationGoToNextPage();
                  if (page !== currentPageNumber) onChangePageClick?.(page);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
