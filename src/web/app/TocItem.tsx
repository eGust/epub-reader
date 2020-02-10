import React from 'react';

import LinkIcon from '@material-ui/icons/Link';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ShortTextIcon from '@material-ui/icons/ShortText';

import { NavItem } from '../epub/types';

interface TocProps {
  item: NavItem;
  idKey: string;
  level: number;
  selected: string;
  getIsOpen: (id: string) => boolean,
  setIsOpen: (id: string, value: boolean) => void,
  onClickItem: (item: NavItem, id: string) => void,
}

const TocItem = ({ item, idKey, selected, level, getIsOpen, setIsOpen, onClickItem }: TocProps) => {
  const { label, items } = item;

  const nextLevel = level + 1;
  const isOpenable = items.length > 0;
  const isOpen = getIsOpen(idKey);
  const isSelected = idKey === selected;

  const subItemProps = {
    level: nextLevel,
    selected, getIsOpen, setIsOpen, onClickItem
  };

  const onClickedItem = () => onClickItem(item, idKey);
  const toggleOpen = () => setIsOpen(idKey, !isOpen);
  const onClickedTitle = isOpenable ? toggleOpen : onClickedItem;

  return (
    <li className={isSelected ? 'selected toc-item' : 'toc-item'}>
      <span className="item">
        <span className={isOpenable ? 'group' : 'link'} onClick={onClickedTitle}>
          {
            isOpenable ? (
              isOpen ? (<ArrowDropDownIcon />) : (<ArrowRightIcon />)
            ) : (
              <ShortTextIcon />
            )
          }
          {
            isOpenable && !isOpen ? (
              <span className="count">{items.length}</span>
            ) : null
          }
          <span className="title" title={label}>{label}</span>
        </span>
        <span className="link" onClick={onClickedItem}>
          {
            isOpenable ? (<LinkIcon />) : null
          }
        </span>
      </span>
      {
        isOpen ? (
          <ul>
            {
              items.map((subItem, idx) => ({ subItem, key: `${idKey}-${idx}` })).map(({ subItem, key }) => (
                <TocItem key={key} item={subItem} idKey={key} {...subItemProps} />
              ))
            }
          </ul>
        ) : null
      }
    </li>
  );
}

export default TocItem;
