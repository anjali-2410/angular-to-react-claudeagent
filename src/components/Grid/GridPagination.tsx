'use client';

import React, { useId, useState, useEffect } from 'react';
import { GridI18n, DEFAULT_I18N } from './types';

export interface GridPaginationProps {
  prevIconDisabled?: boolean;
  nextIconDisabled?: boolean;
  pageNumber: number;
  totalNoOfPagesInGrid: number;
  rangeOfDisplayedItems?: string;
  i18n?: GridI18n;
  onFirstPageClick?: (page: number) => void;
  onBackPageClick?: (page: number) => void;
  onEnterClicked?: (page: number) => void;
  onNextPageClick?: (page: number) => void;
  onLastPageClick?: (page: number) => void;
}

export const GridPagination: React.FC<GridPaginationProps> = ({
  prevIconDisabled = false,
  nextIconDisabled = false,
  pageNumber,
  totalNoOfPagesInGrid,
  rangeOfDisplayedItems = '',
  i18n = {},
  onFirstPageClick,
  onBackPageClick,
  onEnterClicked,
  onNextPageClick,
  onLastPageClick,
}) => {
  const t = { ...DEFAULT_I18N, ...i18n };
  const pageInputId = useId();
  const totalId = useId();
  const [inputPage, setInputPage] = useState(pageNumber);
  const [enterPressed, setEnterPressed] = useState(false);

  useEffect(() => {
    setInputPage(pageNumber);
  }, [pageNumber]);

  const handleEnterClicked = (value: number) => {
    let page = Math.max(1, value);
    page = Math.min(page, totalNoOfPagesInGrid);
    setInputPage(page);
    onEnterClicked?.(page);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEnterPressed(true);
      handleEnterClicked(+(e.target as HTMLInputElement).value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (enterPressed) {
      setEnterPressed(false);
      return;
    }
    handleEnterClicked(+e.target.value);
  };

  return (
    <div className="sol-pagination-wrapper">
      <nav className="navigation" aria-label={t.paginationNavigationLabel}>
        <button
          type="button"
          className="icon nav-beginning buttonicon"
          disabled={prevIconDisabled}
          aria-label={t.goToFirstPage}
          title={t.goToFirstPage}
          onClick={() => onFirstPageClick?.(1)}
        >
          <span className="sol-icon sol-prev pagination-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon nav-back buttonicon"
          disabled={prevIconDisabled}
          aria-label={t.goToPreviousPage}
          title={t.goToPreviousPage}
          onClick={() => onBackPageClick?.(pageNumber - 1)}
        >
          <span className="sol-icon sol-left-chevron pagination-icon" aria-hidden="true" />
        </button>
        <label className="page-number-text" htmlFor={pageInputId}>
          {t.paginationPageLabel}
        </label>
        <input
          id={pageInputId}
          type="number"
          className="page-number-input"
          name="page-number"
          value={inputPage}
          aria-label={t.paginationPageLabel}
          aria-describedby={totalId}
          onChange={(e) => setInputPage(+e.target.value)}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
        />
        <div id={totalId} className="page-number-text">
          {t.ofLabel} {totalNoOfPagesInGrid}
        </div>
        <button
          type="button"
          className="icon nav-next buttonicon"
          disabled={nextIconDisabled}
          aria-label={t.goToNextPage}
          title={t.goToNextPage}
          onClick={() => onNextPageClick?.(pageNumber + 1)}
        >
          <span className="sol-icon sol-right-chevron pagination-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon nav-end buttonicon"
          disabled={nextIconDisabled}
          aria-label={t.goToLastPage}
          title={t.goToLastPage}
          onClick={() => onLastPageClick?.(totalNoOfPagesInGrid)}
        >
          <span className="sol-icon sol-next pagination-icon" aria-hidden="true" />
        </button>
      </nav>
      <div className="data-range" aria-hidden="true">
        {rangeOfDisplayedItems}
      </div>
    </div>
  );
};
