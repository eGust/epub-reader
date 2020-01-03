import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from 'office-ui-fabric-react';

export default { title: 'Button' };

storiesOf('Test', module)
  .add('with text', () => (<Button>Hello Button</Button>))
  .add('with emoji', () => (
    <Button><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>
  ));
