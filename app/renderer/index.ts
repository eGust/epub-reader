import 'office-ui-fabric-core/dist/css/fabric.css';

import './assets/index.styl';

import mountAppTo from './app';

import './ipc';

mountAppTo(document.getElementById('app')!);
