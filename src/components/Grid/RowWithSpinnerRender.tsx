'use client';

import React from 'react';
import { RootCellRender, RootCellRenderParams } from './RootCellRender';

export const RowWithSpinnerRender: React.FC<RootCellRenderParams> = (params) => (
  <RootCellRender {...params} />
);
