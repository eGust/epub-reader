import 'office-ui-fabric-core/dist/css/fabric.css';

import './assets/index.styl';

import mountAppTo from './app';

import './ipc';

import './title_bar';

mountAppTo(document.getElementById('app')!);
