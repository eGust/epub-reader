import React, {
  Dispatch, useState, useMemo,
  FC, MouseEvent,
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { withRouter, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  CommandBar,
  Stack, Nav, INavLinkGroup, INavLink, Panel, PanelType, ICommandBarItemProps,
} from 'office-ui-fabric-react';
import { useConstCallback } from '@uifabric/react-hooks';

import { Action, ActionType } from '../store/actions';
import { StoreState, BookData } from '../store/reducers';
import { NavItem } from '../../ipc/types';

const mapStateToProps = ({ root: state }: StoreState, props: RouteComponentProps) => {
  const { bookData, bookFiles } = state;
  console.log('mapStateToProps', { state, props });
  return { bookData, bookFiles };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  foo: () => dispatch({ type: ActionType.Unknown, data: null }),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> & RouteComponentProps;

interface ReaderRouteParams {
  bookId: string;
  fileId: string;
  path?: string;
}

const convertItem = (item: NavItem, index: number, level: number): INavLink => {
  const link: INavLink = {
    name: item.label,
    url: item.path,
    key: [level, index + 1].filter((x) => x).join('-'),
    isExpanded: false,
  };

  if (item.items.length) {
    const lvl = level + 1;
    link.links = item.items.map((it, idx) => convertItem(it, idx, lvl));
  } else {
    link.icon = 'PageLink';
  }

  return link;
};

const convertToc = ({ toc: { items } }: BookData): INavLinkGroup[] => [{
  links: items.map((item, index) => convertItem(item, index, 0)),
}];

const Reader: FC<Props> = ({ bookData, bookFiles, match }: Props): React.ReactElement => {
  const { bookId, fileId, path = '' } = match.params as ReaderRouteParams;
  const fileInfo = bookFiles[fileId];
  const bookInfo = bookData[bookId];
  const nav = fileInfo.nav.length ? fileInfo.nav : convertToc(bookInfo);

  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  const onOpenPanel = useConstCallback(() => setIsOpen(true));
  const onClosePanel = useConstCallback(() => setIsOpen(false));

  const onClickLink = useConstCallback((ev?: MouseEvent, item?: INavLink) => {
    ev!.preventDefault();
    console.log(item);
    history.push(`/read/${fileId}/${bookId}/${item!.url}`);
  });

  const onLinkExpandClick = useConstCallback((ev?: MouseEvent, item?: INavLink) => {
    console.log('onLinkExpandClick', item);
  });

  const commandItems = useMemo<ICommandBarItemProps[]>(() => [
    {
      key: 'toggle',
      text: '',
      iconProps: { iconName: 'ContextMenu' },
      onClick: onOpenPanel,
    },
  ], []);

  console.log({ bookId, fileId, path }, nav);
  return (
    <Stack style={{ flex: 1 }}>
      <Panel
        isLightDismiss
        type={PanelType.smallFixedNear}
        isOpen={isOpen}
        onDismiss={onClosePanel}
      >
        <Nav groups={nav} onLinkClick={onClickLink} onLinkExpandClick={onLinkExpandClick} />
      </Panel>
      <webview src={`epub://${bookId}/${path}`} style={{ flex: 1 }} />
      <CommandBar items={commandItems} />
    </Stack>
  );
};

export default withRouter(connector(Reader));
