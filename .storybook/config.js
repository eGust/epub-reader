import { addParameters, configure } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import 'office-ui-fabric-core/dist/css/fabric.css';

import '../app/renderer/assets/index.styl';

configure(require.context('../stories', true, /\.stor(y|ies)\.tsx?$/), module);

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
});
