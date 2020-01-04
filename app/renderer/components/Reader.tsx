import React, { FC, Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { Action, ActionType } from '../store/actions';

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  foo: () => dispatch({ type: ActionType.Unknown, data: null }),
});

const connector = connect(null, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> & RouteComponentProps;

interface ReaderRouteParams {
  bookId: string;
  fileId: string;
  path?: string;
}

const Reader: FC<Props> = ({ match }: Props): React.ReactElement => {
  const { bookId, fileId, path = '' } = match.params as ReaderRouteParams;
  console.log({ bookId, fileId, path });
  return (
    <Stack style={{ flex: 1 }}>
      <webview src={`epub://${bookId}/${path}`} style={{ flex: 1 }} />
    </Stack>
  );
};

// export default Reader;

export default withRouter(connect(null, mapDispatchToProps)(Reader));
