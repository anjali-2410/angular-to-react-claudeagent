'use client';

import React, { useState, useCallback } from 'react';
import { ICellRendererParams } from 'ag-grid-community';

export interface AccessibilityCheckboxCellRendererProps extends ICellRendererParams {
  cellRendererParams?: { ariaLabelColumnId?: string };
}

export const AccessibilityCheckboxCellRenderer: React.FC<AccessibilityCheckboxCellRendererProps> = (params) => {
  const getChecked = () => params.node?.isSelected() || false;
  const [checked, setChecked] = useState(getChecked);

  const getAriaLabel = useCallback(() => {
    if (!params.data) return 'Select row';
    const cellRendererParams = params.colDef?.cellRendererParams as any;
    let labelValue = 'row';

    if (cellRendererParams?.ariaLabelColumnId) {
      labelValue = params.data[cellRendererParams.ariaLabelColumnId] ?? 'row';
    } else {
      const columns = params.api.getAllDisplayedColumns();
      for (const column of columns) {
        const colDef = column.getColDef();
        if (!colDef.checkboxSelection && !colDef.headerCheckboxSelection) {
          const fieldName = colDef.field || column.getColId();
          labelValue = params.data[fieldName] ?? 'row';
          break;
        }
      }
    }
    return `Select ${labelValue}`;
  }, [params]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!params.node) return;
    params.node.setSelected(event.target.checked);
    setChecked(event.target.checked);
  };

  return (
    <input
      type="checkbox"
      className="ag-checkbox"
      checked={checked}
      aria-label={getAriaLabel()}
      onChange={handleChange}
    />
  );
};
