import React, { useState, useCallback, ChangeEvent } from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TextField from '@material-ui/core/TextField';

import CloseIcon from '@material-ui/icons/Close';

import TabPanel from './TabPanel';

interface SettingsModalProps {
  open: boolean;
  css: string;
  onClose: (data?: { css: string }) => void;
}

const SettingsModal = ({ open, css, onClose }: SettingsModalProps) => {
  const [currentCss, setCurrentCss] = useState(css);
  const onUpdateCss = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setCurrentCss(ev.target.value);
  }, [setCurrentCss]);
  const onCloseWithoutSave = useCallback(() => onClose(), [onClose]);
  const onCloseAndSave = useCallback(() => onClose({ css: currentCss }), [currentCss, onClose]);
  return (
    <Modal className="settings-modal" open={open}>
      <Card className="settings-box">
        <CardHeader
          title="Settings"
          action={(
            <IconButton color="secondary" onClick={onCloseWithoutSave}>
              <CloseIcon />
            </IconButton>
          )}
        />
        <CardContent>
          <Tabs value="css">
            <Tab label="CSS" value="css" />
            <Tab label="Keyboard Shortcuts" value="key" />
          </Tabs>
          <TabPanel>
            <TextField
              className="code"
              variant="outlined"
              label="CSS"
              rows="8"
              multiline
              value={currentCss}
              onChange={onUpdateCss}
            />
          </TabPanel>
        </CardContent>
        <CardActions>
          <Button color="primary" onClick={onCloseAndSave}>Save</Button>
        </CardActions>
      </Card>
    </Modal>
  );
}


export default SettingsModal;
