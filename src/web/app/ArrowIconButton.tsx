import React, { useCallback, useMemo, MouseEvent } from 'react';
import { Direction } from './types';

interface ArrowIconButtonProps {
  direction: Direction;
  onClick: (direction: Direction) => void;
}

const DIRECTION_CLASS_NAME: Record<Direction, string> = {
  [Direction.prev]: 'direction-prev',
  [Direction.next]: 'direction-next',
};

const ArrowIconButton = ({ direction, onClick }: ArrowIconButtonProps) => (
  <div className={`arrow-icon-button ${DIRECTION_CLASS_NAME[direction]}`} onClick={() => onClick(direction)}>
    <div className="caret"></div>
  </div>
);

export default ArrowIconButton;
