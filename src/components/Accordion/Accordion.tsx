import React, { createContext, useState } from 'react';
import './Accordion.css';

export interface AccordionGroupContextValue {
  multiple: boolean;
  /** ID of the most recently opened item — used to close siblings in single mode */
  lastOpenedId: string;
  notifyOpened: (id: string) => void;
}

export const AccordionGroupContext = createContext<AccordionGroupContextValue | null>(null);

export interface AccordionGroupProps {
  /** Allow multiple panels open simultaneously */
  multiple?: boolean;
  /** HTML id for the accordion container */
  id?: string | null;
  children?: React.ReactNode;
}

export const AccordionGroup: React.FC<AccordionGroupProps> = ({
  multiple = false,
  id = null,
  children,
}) => {
  const [lastOpenedId, setLastOpenedId] = useState('');

  return (
    <AccordionGroupContext.Provider
      value={{ multiple, lastOpenedId, notifyOpened: setLastOpenedId }}
    >
      <div className="sol-accordion-group" id={id || undefined}>
        {children}
      </div>
    </AccordionGroupContext.Provider>
  );
};
