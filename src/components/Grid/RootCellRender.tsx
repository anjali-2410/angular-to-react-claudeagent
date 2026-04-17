'use client';

import React, { useState, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { ColDefWithCustomProperties } from './types';

export interface RootCellRenderParams extends ICellRendererParams {
  colDef: ColDefWithCustomProperties<any>;
}

export const RootCellRender: React.FC<RootCellRenderParams> = (params) => {
  const [isShowSpinner, setIsShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsShowSpinner(true));
    return () => clearTimeout(timer);
  }, []);

  const isValueExists = params.value !== undefined;
  const showSpinner = isShowSpinner && !!params.colDef?.isShowSpinner;

  return (
    <div className="default-renderer">
      <div className="cell-content">
        {isValueExists && <span>{params.value}</span>}
        {showSpinner && <span className="sol-spinner" aria-hidden="true" />}
      </div>
    </div>
  );
};
