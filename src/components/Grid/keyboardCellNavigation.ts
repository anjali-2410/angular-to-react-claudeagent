import { SuppressKeyboardEventParams } from 'ag-grid-community';

const GRID_CELL_CLASSNAME = 'ag-cell';

function getAllFocusableElementsOf(el: HTMLElement) {
  return Array.from<HTMLElement>(
    el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((focusableEl) => focusableEl.tabIndex !== -1);
}

function getEventPath(event: Event): HTMLElement[] {
  const path: HTMLElement[] = [];
  let currentTarget: any = event.target;
  while (currentTarget) {
    path.push(currentTarget);
    currentTarget = currentTarget.parentElement;
  }
  return path;
}

export function suppressKeyboardEvent({ event }: SuppressKeyboardEventParams) {
  const { key, shiftKey } = event;
  const path = getEventPath(event);
  const isTabForward = key === 'Tab' && shiftKey === false;
  const isTabBackward = key === 'Tab' && shiftKey === true;
  let suppressEvent = false;

  if (isTabForward || isTabBackward) {
    const eGridCell = path.find((el) => {
      if (el.classList === undefined) return false;
      return el.classList.contains(GRID_CELL_CLASSNAME);
    });
    if (!eGridCell) return suppressEvent;

    const focusableChildrenElements = getAllFocusableElementsOf(eGridCell);
    const lastCellChildEl = focusableChildrenElements[focusableChildrenElements.length - 1];
    const firstCellChildEl = focusableChildrenElements[0];

    if (isTabForward && focusableChildrenElements.length > 0) {
      const isLastChildFocused = lastCellChildEl && document.activeElement === lastCellChildEl;
      if (!isLastChildFocused) suppressEvent = true;
    } else if (isTabBackward && focusableChildrenElements.length > 0) {
      const cellHasFocusedChildren =
        eGridCell.contains(document.activeElement) && eGridCell !== document.activeElement;
      if (!cellHasFocusedChildren) {
        lastCellChildEl.focus();
        event.preventDefault();
      }
      const isFirstChildFocused = firstCellChildEl && document.activeElement === firstCellChildEl;
      if (!isFirstChildFocused) suppressEvent = true;
    }
  }
  return suppressEvent;
}
