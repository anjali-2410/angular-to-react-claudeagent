'use client';

import React from 'react';
import { INoRowsOverlayParams } from 'ag-grid-community';

export interface NoResultsOverlayParams extends INoRowsOverlayParams {
  message?: string;
}

export const NoResultsOverlay: React.FC<NoResultsOverlayParams> = ({ message }) => (
  <div className="sol-no-results-overlay ag-overlay-no-rows-center">
    <span>{message || 'No results'}</span>
  </div>
);
