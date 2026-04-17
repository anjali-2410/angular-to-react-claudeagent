'use client';

import React from 'react';
import { RootCellRender, RootCellRenderParams } from './RootCellRender';

export const SpinnerRender: React.FC<RootCellRenderParams> = (params) => (
  <RootCellRender {...params} />
);
