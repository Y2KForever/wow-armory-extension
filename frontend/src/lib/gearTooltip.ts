export type SlotColumn = 'L' | 'R' | 'B';

const ZONE = 418;
const PAD = 8;
const SLOT = 44;
const PITCH = 48;
const WEAPON_TOP = ZONE - PAD - SLOT;
const SIDE_INSET = 56;
const EDGE = 6;
const GOLD = '1px solid #8a6d14';

export interface TooltipGeometry {
  left: string;
  right: string;
  top: string;
  bottom: string;
  maxHeight: string;
  arrow: {
    left: string;
    right: string;
    top: string;
    bottom: string;
    borderLeft: string;
    borderBottom: string;
    borderTop: string;
    borderRight: string;
  };
}

export const tooltipGeometry = (column: SlotColumn, index: number): TooltipGeometry => {
  const base = { left: `${SIDE_INSET}px`, right: `${SIDE_INSET}px` };

  if (column === 'B') {
    return {
      ...base,
      top: 'auto',
      bottom: '60px',
      maxHeight: '296px',
      arrow: {
        left: index === 0 ? '30%' : '70%',
        right: 'auto',
        top: 'auto',
        bottom: '-5px',
        borderLeft: 'none',
        borderBottom: GOLD,
        borderTop: 'none',
        borderRight: GOLD,
      },
    };
  }

  const slotTop = PAD + index * PITCH;
  const slotBottom = slotTop + SLOT;
  const slotMiddle = slotTop + SLOT / 2;
  const side =
    column === 'L'
      ? { left: '-5px', right: 'auto', borderLeft: GOLD, borderBottom: GOLD, borderTop: 'none', borderRight: 'none' }
      : { left: 'auto', right: '-5px', borderLeft: 'none', borderBottom: 'none', borderTop: GOLD, borderRight: GOLD };

  if (WEAPON_TOP - EDGE - slotTop >= slotBottom - EDGE) {
    const top = Math.max(EDGE, slotTop);
    return {
      ...base,
      top: `${top}px`,
      bottom: 'auto',
      maxHeight: `${WEAPON_TOP - EDGE - top}px`,
      arrow: {
        left: side.left,
        right: side.right,
        top: `${Math.max(EDGE, slotMiddle - top - 4)}px`,
        bottom: 'auto',
        borderLeft: side.borderLeft,
        borderBottom: side.borderBottom,
        borderTop: side.borderTop,
        borderRight: side.borderRight,
      },
    };
  }

  const bottomInset = Math.max(ZONE - slotBottom, ZONE - (WEAPON_TOP - EDGE));
  const bottomEdge = ZONE - bottomInset;
  return {
    ...base,
    top: 'auto',
    bottom: `${bottomInset}px`,
    maxHeight: `${bottomEdge - EDGE}px`,
    arrow: {
      left: side.left,
      right: side.right,
      top: 'auto',
      bottom: `${Math.max(EDGE, bottomEdge - slotMiddle - 4)}px`,
      borderLeft: side.borderLeft,
      borderBottom: side.borderBottom,
      borderTop: side.borderTop,
      borderRight: side.borderRight,
    },
  };
};
