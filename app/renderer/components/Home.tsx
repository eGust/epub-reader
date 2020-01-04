import React, {
  FC, useRef, ChangeEvent, Dispatch,
} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ActionButton } from 'office-ui-fabric-react';
import { apiOpenFile, ApiPackage } from '../api/open_file';

import { actionOpenFile, Action } from '../store/actions';

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  openFile: (file: ApiPackage) => {
    dispatch(actionOpenFile(file));
  },
});

type Props = ReturnType<typeof mapDispatchToProps>;

const Home: FC<Props> = ({ openFile }: Props): React.ReactElement => {
  const fileRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const onOpenFile = () => {
    fileRef.current?.click();
  };

  const onSelectFile = async (ev: ChangeEvent<HTMLInputElement>) => {
    const { target } = ev;
    const file = target.files![0];
    const data = await apiOpenFile(file);
    target.files = null;
    if (!data) {
      console.error('unable to open file:', file);
      return;
    }

    console.log(data);
    openFile(data);
    setTimeout(() => {
      history.push(`/read/${data.fileId}/${data.bookId}/`);
    }, 0);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept=".epub" className="hide" onChange={onSelectFile} />
      <ActionButton iconProps={{ iconName: 'OpenFile' }} onClick={onOpenFile}>
        Open
      </ActionButton>
    </div>
  );
};

// export default Home;

export default connect(null, mapDispatchToProps)(Home);
