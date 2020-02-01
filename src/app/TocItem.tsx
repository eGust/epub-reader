import React from 'react';

import LinkIcon from '@material-ui/icons/Link';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ShortTextIcon from '@material-ui/icons/ShortText';

import { NavItem } from '../epub/types';

interface TocProps {
  item: NavItem;
  index: number;
  level: number;
  selected: string;
  getIsOpen: (id: string) => boolean,
  setIsOpen: (id: string, value: boolean) => void,
  onClickItem: (item: NavItem) => void,
}

const TocItem = ({ item, index, selected, level, getIsOpen, setIsOpen, onClickItem }: TocProps) => {
  const { label, items } = item;

  const nextLevel = level + 1;
  const id = `${nextLevel}-${index + 1}`;

  const isOpenable = items.length > 0;
  const isOpen = getIsOpen(id);
  const isSelected = id === selected;

  const subItemProps = {
    level: nextLevel,
    selected, getIsOpen, setIsOpen, onClickItem
  };

  const onClickedItem = () => onClickItem(item);
  const toggleOpen = () => setIsOpen(id, !isOpen);
  const onClickedTitle = isOpenable ? toggleOpen : onClickedItem;

  return (
    <li className={isSelected ? 'selected toc-item' : 'toc-item'}>
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
      {
        isOpen ? (
          <ul>
            {
              items.map((subItem, idx) => (
                <TocItem key={`${id}-${idx}`} item={subItem} index={idx} {...subItemProps} />
              ))
            }
          </ul>
        ) : null
      }
    </li>
  );
}

export default TocItem;
