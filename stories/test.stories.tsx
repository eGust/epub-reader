import React from 'react';
import { storiesOf } from '@storybook/react';
import { FocusZone, PrimaryButton, Button } from 'office-ui-fabric-react';

export default { title: 'Button' };

storiesOf('Test', module)
  .add('with text', () => (
    <FocusZone>
      <PrimaryButton iconProps={{ iconName: 'OpenFile' }}>
        Open
      </PrimaryButton>
    </FocusZone>
  ))
  .add('with emoji', () => (
    <Button><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>
  ));
