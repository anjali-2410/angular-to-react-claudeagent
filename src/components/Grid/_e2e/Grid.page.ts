import { Page, Locator } from '@playwright/test';

export enum Sorting {
  ASC = 'asc',
  DESC = 'desc',
  NONE = 'none',
}

export const SELECTORS = {
  TEXT: (value: string) => `text=${value}`,
  HEADER_CELL_BY_COLUMN_NUM: (num: number) => `${SELECTORS.HEADER_CELL}:nth-child(${num})`,
  HEADER_CELL_BY_TITLE: (title: string) => `${SELECTORS.HEADER_CELL} :has-text("${title}")`,
  HEADER_IS_SORT_BY_TITLE_AND_STATUS: (title: string, status: string) =>
    `${SELECTORS.HEADER_CELL} .ag-cell-label-container.ag-header-cell-sorted-${status} :has-text("${title}")`,
  CLICK_ON_ROW_BY_INDEX: (index: number) => `.ag-center-cols-container .ag-row >> nth=${index}`,
  SELECT_ROW_CHECK_BOX_BY_INDEX: (index: number) => `.ag-selection-checkbox >> nth=${index}`,
  CELL_TEXT: (row: any, col: any) => `.ag-row[row-index="${row}"] > div[col-id="${col}"]`,
  ROW_SELECTOR: (row: any) => `div.ag-row[row-index='${row}']`,
  CELL_SELECTOR: (col: any) => `div[col-id='${col}']`,
  HEADER_CELL: '.ag-header .ag-header-row .ag-header-cell',
  HEADER_CELL_TEXT: '.ag-header-cell-text',
  SELECT_ALL_CHECK_BOX: '.ag-header-select-all',
  ROW: '.ag-center-cols-container .ag-row',
  CELL: '.ag-center-cols-container .ag-row .ag-cell',
};

export class GridPage {
  static DEFAULT_TIMEOUT = 2_000;

  constructor(private page: Page) {}

  async getGridHeaders() {
    const elems = await this.page.$$(SELECTORS.HEADER_CELL_TEXT);
    const headers: string[] = [];
    for (const elem of elems) {
      const text = await elem.innerText();
      headers.push(text || '');
    }
    return headers;
  }

  async selectRowCheckboxByIndex(index = 0, delayTime = 100) {
    return this.page.click(SELECTORS.SELECT_ROW_CHECK_BOX_BY_INDEX(index), { delay: delayTime });
  }

  async selectAllCheckbox() {
    return this.page.click(SELECTORS.SELECT_ALL_CHECK_BOX);
  }

  async clickOnRowByIndex(index = 0) {
    return this.page.click(SELECTORS.CLICK_ON_ROW_BY_INDEX(index));
  }

  async clickOnRowByName(name: string) {
    await this.page.waitForSelector(SELECTORS.TEXT(name));
    return this.page.click(SELECTORS.TEXT(name));
  }

  getRowSelector(row: any) {
    return SELECTORS.ROW_SELECTOR(row);
  }

  getCellUpperDivSelector(row: any, col: any) {
    return this.getRowSelector(row) + ' ' + SELECTORS.CELL_SELECTOR(col);
  }

  getCellElement(row: number, col: string) {
    return this.page.$(this.getCellUpperDivSelector(row, col));
  }

  async getCellText(row: number, col: string) {
    return this.page.innerText(SELECTORS.ROW_SELECTOR(row) + ' ' + SELECTORS.CELL_SELECTOR(col));
  }

  async getRowFieldValues() {
    const elems = await this.page.$$(SELECTORS.CELL);
    const rowValues: string[] = [];
    for (const elem of elems) {
      const text = await elem.innerText();
      rowValues.push(text || '');
    }
    return rowValues;
  }

  async getVisibleRowCount() {
    return (await this.page.$$(SELECTORS.ROW)).length;
  }

  private getColumnHeaderLocatorByNumber(columnNumber: number): Locator {
    return this.page.locator(SELECTORS.HEADER_CELL_BY_COLUMN_NUM(columnNumber));
  }

  private getColumnHeaderLocatorByTitle(columnTitle: string): Locator {
    return this.page.locator(SELECTORS.HEADER_CELL_BY_TITLE(columnTitle)).first();
  }

  async getColumnHeaderTextByNumber(columnNumber: number): Promise<string> {
    return this.page.locator(SELECTORS.HEADER_CELL_BY_COLUMN_NUM(columnNumber)).innerText();
  }

  async isColumnSortByStatus(columnTitle: string, status: Sorting): Promise<boolean> {
    if (status !== Sorting.NONE) {
      return (
        (await this.page
          .locator(SELECTORS.HEADER_IS_SORT_BY_TITLE_AND_STATUS(columnTitle, status))
          .first()
          .count()) > 0
      );
    }
    const isAsc = await this.page
      .locator(SELECTORS.HEADER_IS_SORT_BY_TITLE_AND_STATUS(columnTitle, Sorting.ASC))
      .first()
      .count();
    const isDesc = await this.page
      .locator(SELECTORS.HEADER_IS_SORT_BY_TITLE_AND_STATUS(columnTitle, Sorting.DESC))
      .first()
      .count();
    return isAsc + isDesc < 1;
  }

  async getColumnSortStatus(columnTitle: string): Promise<Sorting> {
    if (await this.isColumnSortByStatus(columnTitle, Sorting.ASC)) return Sorting.ASC;
    if (await this.isColumnSortByStatus(columnTitle, Sorting.DESC)) return Sorting.DESC;
    return Sorting.NONE;
  }

  async setColumnSortByStatus(columnTitle: string, status: Sorting) {
    const current = await this.getColumnSortStatus(columnTitle);
    if (current === status) return;
    if (
      (current === Sorting.NONE && status === Sorting.DESC) ||
      (current === Sorting.DESC && status === Sorting.ASC) ||
      (current === Sorting.ASC && status === Sorting.NONE)
    ) {
      await this.getColumnHeaderLocatorByTitle(columnTitle).click();
    } else {
      await this.getColumnHeaderLocatorByTitle(columnTitle).dblclick();
    }
  }

  async moveColumn(columnTitle: string, toColumnNumber: number): Promise<void> {
    const fromBox = await this.getColumnHeaderLocatorByTitle(columnTitle).boundingBox();
    const toBox = await this.getColumnHeaderLocatorByNumber(toColumnNumber).boundingBox();
    if (fromBox) {
      await this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
      await this.page.mouse.down();
    }
    if (toBox && fromBox) {
      await this.page.mouse.move(toBox.x + toBox.width / 2, fromBox.y + fromBox.height / 2, { steps: 5 });
    }
    await this.page.mouse.up();
  }
}
