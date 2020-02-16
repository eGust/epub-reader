import React from 'react';

import LinkIcon from '@material-ui/icons/Link';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ShortTextIcon from '@material-ui/icons/ShortText';

import { ContentItem } from './path_helper';

interface TocProps {
  item: ContentItem;
  selected: { id: string, parentIds: Set<string> };
  getIsOpen: (id: string) => boolean,
  setIsOpen: (id: string, value: boolean) => void,
  onClickItem: (item: ContentItem) => void,
}

const TocItem = ({ item, selected, getIsOpen, setIsOpen, onClickItem }: TocProps) => {
  const { label, items } = item;

  const isOpenable = items.length > 0;
  const isOpen = getIsOpen(item.id);

  const subItemProps = {
    selected, getIsOpen, setIsOpen, onClickItem
  };

  const onClickedItem = () => onClickItem(item);
  const toggleOpen = () => setIsOpen(item.id, !isOpen);
  const onClickedTitle = isOpenable ? toggleOpen : onClickedItem;

  return (
    <li className={`toc-item ${item.id === selected.id ? 'selected' : ''}`}>
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
          <span className={`title ${selected.parentIds.has(item.id) ? 'selected' : ''}`} title={label}>{label}</span>
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
              items.map((subItem) => (
                <TocItem key={subItem.id} item={subItem} {...subItemProps} />
              ))
            }
          </ul>
        ) : null
      }
    </li>
  );
}

export default TocItem;
