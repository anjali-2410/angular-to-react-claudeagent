'use client';

import React from 'react';
import { RootCellRender, RootCellRenderParams } from './RootCellRender';

export const CellWithSpinnerRender: React.FC<RootCellRenderParams> = (params) => (
  <RootCellRender {...params} />
);
