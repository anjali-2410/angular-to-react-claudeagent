import { take } from 'rxjs/operators';
import {
  DragStoppedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IGetRowsParams,
  IServerSideGetRowsParams,
  IViewportDatasource,
  LoadSuccessParams,
  SortChangedEvent,
} from 'ag-grid-community';
import { GridOptionsCellSpinnerProp, ICompatibleDatasource, ICompatibleServerSideDatasource, ColDefWithCustomProperties } from './types';

export type InfiniteScrollAnnouncementCallbacks = {
  onRequestStart?: (startRow: number) => void;
  onRequestSuccess?: (loadedCount: number, totalShown: number) => void;
};

export class GridEventUtils {
  static onGridReady<TRequest, TData>(
    params: GridReadyEvent,
    dSource: ICompatibleDatasource<TRequest> | ICompatibleServerSideDatasource<TRequest> | IViewportDatasource | null,
    options: GridOptionsCellSpinnerProp,
    infiniteScrollAnnouncements?: InfiniteScrollAnnouncementCallbacks
  ) {
    const gridApi: GridApi<TData> = params.api;
    gridApi.showLoadingOverlay();
    if (dSource) {
      const callbackWrapper = (p: IGetRowsParams & IServerSideGetRowsParams) => {
        const isInfiniteRowModel = options.rowModelType === 'infinite';
        if (isInfiniteRowModel) {
          infiniteScrollAnnouncements?.onRequestStart?.(p.startRow ?? 0);
        }

        if (gridApi.getGridOption('rowModelType') === 'serverSide' && gridApi.paginationGetPageSize() > 0) {
          gridApi.showLoadingOverlay();
        }

        if ('getRows' in dSource) {
          if (p.successCallback) {
            const successCallbackOriginal = p.successCallback;
            p.successCallback = (rowsThisBlock: any[], lastRow?: number) => {
              successCallbackOriginal(rowsThisBlock, lastRow);
              gridApi.hideOverlay();
              if (isInfiniteRowModel) {
                const loadedCount = rowsThisBlock?.length ?? 0;
                const totalShown = (p.startRow ?? 0) + loadedCount;
                infiniteScrollAnnouncements?.onRequestSuccess?.(loadedCount, totalShown);
              }
            };
          }

          if (p.success) {
            const successCallbackOriginal = p.success;
            p.success = (par: LoadSuccessParams) => {
              successCallbackOriginal(par);
              gridApi.hideOverlay();
              if (isInfiniteRowModel) {
                const loadedCount = par.rowData?.length ?? 0;
                const totalShown = (p.startRow ?? 0) + loadedCount;
                infiniteScrollAnnouncements?.onRequestSuccess?.(loadedCount, totalShown);
              }
            };
          }

          if (p.failCallback) {
            const failCallbackOriginal = p.failCallback;
            p.failCallback = () => {
              failCallbackOriginal();
              gridApi.hideOverlay();
            };
          }

          const res = (dSource as ICompatibleDatasource<TRequest> | ICompatibleServerSideDatasource<TRequest>).getRows(p);
          if (res !== undefined) {
            res.pipe(take(1)).subscribe(() => {
              gridApi.hideOverlay();
            });
          }
        }
      };

      const dataSource = { ...dSource, getRows: callbackWrapper };

      switch (options.rowModelType) {
        case 'serverSide':
          gridApi.setGridOption('serverSideDatasource', dataSource);
          break;
        case 'infinite':
          gridApi.setGridOption('datasource', dataSource);
          break;
        case 'viewport':
          gridApi.setGridOption('viewportDatasource', dSource as IViewportDatasource);
          break;
        default:
          break;
      }
    }
  }

  static toPatchSuccessCallback(
    gridOptions: GridOptionsCellSpinnerProp,
    infiniteScrollAnnouncements?: InfiniteScrollAnnouncementCallbacks
  ) {
    return {
      onGridReady: (event: GridReadyEvent<any>) => {
        const originalOnGridReady = gridOptions.onGridReady;
        gridOptions.onGridReady = (e: GridReadyEvent, _d?: any, _o?: GridOptions) => {
          const originalApi = e.api;
          const originalSetGridOption = originalApi.setGridOption.bind(originalApi);

          originalApi.setGridOption = (optionName: any, optionValue: any) => {
            if (optionName === 'datasource') {
              const originalDataSourceGetRows = optionValue.getRows;
              optionValue.getRows = (params: IGetRowsParams & IServerSideGetRowsParams) => {
                const isInfiniteRowModel = gridOptions.rowModelType === 'infinite';
                if (isInfiniteRowModel) {
                  infiniteScrollAnnouncements?.onRequestStart?.(params.startRow ?? 0);
                }

                if (params.successCallback) {
                  const originalSuccessCallback = params.successCallback;
                  params.successCallback = (rowsThisBlock: any[], lastRow?: number) => {
                    originalSuccessCallback(rowsThisBlock, lastRow);
                    originalApi.hideOverlay();
                    if (isInfiniteRowModel) {
                      const loadedCount = rowsThisBlock?.length ?? 0;
                      const totalShown = (params.startRow ?? 0) + loadedCount;
                      infiniteScrollAnnouncements?.onRequestSuccess?.(loadedCount, totalShown);
                    }
                  };
                }
                if (params.success) {
                  const originalSuccess = params.success;
                  params.success = (pr: LoadSuccessParams) => {
                    originalSuccess(pr);
                    originalApi.hideOverlay();
                    if (isInfiniteRowModel) {
                      const loadedCount = pr.rowData?.length ?? 0;
                      const totalShown = (params.startRow ?? 0) + loadedCount;
                      infiniteScrollAnnouncements?.onRequestSuccess?.(loadedCount, totalShown);
                    }
                  };
                }

                originalDataSourceGetRows(params);
              };
            }
            originalSetGridOption(optionName, optionValue);
          };

          originalOnGridReady!(e);
        };
        gridOptions.onGridReady!(event);
      },
    };
  }

  static toConfigureColumns<TData>(
    params: GridReadyEvent,
    options: GridOptionsCellSpinnerProp,
    RootCellRenderer: React.ComponentType<any>
  ) {
    const columns = params.api.getAllDisplayedColumns().reduce((acc, value) => {
      const colDef = value.getColDef() as ColDefWithCustomProperties<TData>;
      if (colDef.cellRenderer) {
        if (colDef.cellRenderer === RootCellRenderer) {
          acc.push(colDef);
        }
      } else if (!(colDef.checkboxSelection || colDef.headerCheckboxSelection)) {
        colDef.cellRenderer = options.cellRenderer;
        acc.push(colDef);
      }
      colDef.isShowSpinner = false;
      return acc;
    }, [] as ColDefWithCustomProperties<TData>[]);

    if (columns.length) {
      columns[0].isShowSpinner = true;
    }
  }

  static onSortChanged<TData>(params: SortChangedEvent<TData>) {
    params.api.showLoadingOverlay();
  }

  static onDragStopped<TData>(
    params: DragStoppedEvent<TData>,
    className: any,
    RootCellRenderer: React.ComponentType<any>
  ): void {
    if (className) {
      const columns = params.api
        .getAllDisplayedColumns()
        .map((el) => el.getColDef() as ColDefWithCustomProperties<TData>);
      const columnsForSpinner = columns.filter(
        (col) => col.cellRenderer && col.cellRenderer === RootCellRenderer
      );
      const firstColumn = columnsForSpinner[0];
      if (firstColumn && !firstColumn.pinned) {
        columnsForSpinner.forEach((el, index) => {
          el.isShowSpinner = index === 0;
        });
      }
    }
  }
}
