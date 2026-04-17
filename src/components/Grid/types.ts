import { ColDef, ColGroupDef, GridOptions, IDatasource, IGetRowsParams, IServerSideDatasource, IServerSideGetRowsParams, ICellRendererParams } from 'ag-grid-community';
import { Observable } from 'rxjs';

export interface ColDefWithCustomProperties<TData = any> extends ColDef<TData> {
  isShowSpinner?: boolean;
}

export interface ColGroupDefWithCustomProperties<TData = any> extends ColGroupDef<TData> {}

export interface GridOptionsCellSpinnerProp<TData = any> extends GridOptions<TData> {
  cellRenderer?: any;
}

export interface ICompatibleDatasource<T = any> extends IDatasource {
  getRows(params: IGetRowsParams): Observable<T> | void;
}

export interface ICompatibleServerSideDatasource<T = any> extends IServerSideDatasource {
  getRows(params: IServerSideGetRowsParams): Observable<T> | void;
}

export interface ICellRenderParamsCustomColDef<T = any> extends ICellRendererParams {
  value: T;
  colDef: ColDefWithCustomProperties<any>;
}

export interface GridI18n {
  segmentsLabel?: string;
  gridSortableColumn?: string;
  gridReadyLoadingData?: string;
  gridLoadedWithRows?: (count: number) => string;
  gridSortAscending?: string;
  gridSortDescending?: string;
  gridSortedBy?: (column: string, direction: string) => string;
  gridSortCleared?: (count: number) => string;
  gridLoadingMoreRows?: string;
  gridLoadedMoreRows?: (loaded: number, total: number) => string;
  gridNoRowsSelected?: string;
  gridRowsSelected?: (count: number) => string;
  gridPaginationStatus?: (page: number, totalPages: number, first: number, last: number, total: number) => string;
  rangeOfDisplayedItems?: (first: number, last: number, total: number) => string;
  noResult?: string;
  loading?: string;
  goToFirstPage?: string;
  goToPreviousPage?: string;
  goToNextPage?: string;
  goToLastPage?: string;
  paginationNavigationLabel?: string;
  paginationPageLabel?: string;
  ofLabel?: string;
}

export const DEFAULT_I18N: Required<GridI18n> = {
  segmentsLabel: 'items',
  gridSortableColumn: 'Activate to sort',
  gridReadyLoadingData: 'Loading data...',
  gridLoadedWithRows: (count) => `Grid loaded with ${count} rows`,
  gridSortAscending: 'ascending',
  gridSortDescending: 'descending',
  gridSortedBy: (col, dir) => `Sorted by ${col} ${dir}`,
  gridSortCleared: (count) => `Sort cleared. ${count} rows displayed.`,
  gridLoadingMoreRows: 'Loading more rows...',
  gridLoadedMoreRows: (loaded, total) => `Loaded ${loaded} more rows. ${total} rows shown.`,
  gridNoRowsSelected: 'No rows selected',
  gridRowsSelected: (count) => `${count} rows selected`,
  gridPaginationStatus: (page, total, first, last, count) =>
    `Page ${page} of ${total}, showing ${first} to ${last} of ${count} rows`,
  rangeOfDisplayedItems: (first, last, total) => `${first} - ${last} of ${total}`,
  noResult: 'No results',
  loading: 'Loading',
  goToFirstPage: 'Go to first page',
  goToPreviousPage: 'Go to previous page',
  goToNextPage: 'Go to next page',
  goToLastPage: 'Go to last page',
  paginationNavigationLabel: 'Pagination',
  paginationPageLabel: 'Page',
  ofLabel: 'of',
};
