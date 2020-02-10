import React, { useState, useEffect } from 'react'

import { Navigation, NavItem } from '../epub/types';
import TocItem from './TocItem';

interface TocViewProps {
  nav: Navigation;
  selected: string;
  show: boolean;
  onClickItem: (item: NavItem, id: string) => void,
}

const TocView = ({ nav, selected, show, onClickItem }: TocViewProps) => {
  const [openDict, setOpenDict] = useState<Record<string, boolean>>(() => ({}))
  const getIsOpen = (id: string): boolean => openDict[id] || false;
  const setIsOpen = (id: string, value: boolean): void => {
    setOpenDict({
      ...openDict,
      [id]: value,
    });
  };

  useEffect(() => {
    setOpenDict(nav.items.mapToObject((_, index) => [`1-${index+1}`, true]));
  }, [nav]);

  const itemProps = { level: 0, selected, getIsOpen, setIsOpen, onClickItem };

  return (
    <ul className={show ? "toc" : "hide"}>
      {
        nav.items.map((item, index) => ({ item, key: `1-${index}` })).map(({ item, key }) => (
          <TocItem key={key} item={item} idKey={key} {...itemProps} />
        ))
      }
    </ul>
  );
}

export default TocView;
