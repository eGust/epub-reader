import React, { useState } from 'react'

import { Navigation, NavItem } from '../epub/types';
import TocItem from './TocItem';

interface TocViewProps {
  nav: Navigation;
  selected: string;
  show: boolean;
  onClickItem: (item: NavItem) => void,
}

const TocView = ({ nav, selected, show, onClickItem }: TocViewProps) => {
  const [openDict, setOpenDict] = useState<Record<string, boolean>>(() => Object.fromEntries(
    nav.items.map((_item, index) => [`1-${index+1}`, true])
  ));
  const getIsOpen = (id: string): boolean => openDict[id] || false;
  const setIsOpen = (id: string, value: boolean): void => {
    setOpenDict({
      ...openDict,
      [id]: value,
    });
  };
  const itemProps = { level: 0, selected, getIsOpen, setIsOpen, onClickItem };

  return (
    <ul className={show ? "toc" : "hide"}>
      {
        nav.items.map((item, index) => (
          <TocItem key={`1-${index}`} item={item} index={index} {...itemProps} />
        ))
      }
    </ul>
  );
}

export default TocView;
