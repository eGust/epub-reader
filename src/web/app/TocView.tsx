import React, { useState, useEffect } from 'react'

import TocItem from './TocItem';
import { PathHelper, ContentItem } from './path_helper';

interface TocViewProps {
  helper: PathHelper;
  selected: { id: string, parentIds: Set<string> };
  show: boolean;
  onClickItem: (item: ContentItem) => void,
}

const TocView = ({ helper, selected, show, onClickItem }: TocViewProps) => {
  const [openDict, setOpenDict] = useState<Record<string, boolean>>(() => ({}))
  const getIsOpen = (id: string): boolean => openDict[id] || false;
  const setIsOpen = (id: string, value: boolean): void => {
    setOpenDict({
      ...openDict,
      [id]: value,
    });
  };

  useEffect(() => {
    setOpenDict(helper.tocItems.mapToObject(({ id }) => [id, true]));
  }, [helper]);

  const itemProps = { selected, getIsOpen, setIsOpen, onClickItem };

  return (
    <ul className={show ? "toc" : "hide"}>
      {
        helper.tocItems.map((item) => (
          <TocItem key={item.id} item={item} {...itemProps} />
        ))
      }
    </ul>
  );
}

export default TocView;
