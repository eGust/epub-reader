import * as React from 'react';
import { hot } from 'react-hot-loader';
import { HashRouter, Route } from 'react-router-dom';

import Home from '../components/Home';
import Reader from '../components/Reader';

const RootRouter = () => (
  <HashRouter>
    <Route exact path="/" component={Home} />
    <Route path="/read/:fileId/:bookId/:path*" component={Reader} />
  </HashRouter>
);

const Routes = process.env.NODE_ENV !== 'production' ? hot(module)(RootRouter) : RootRouter;

export default Routes;
