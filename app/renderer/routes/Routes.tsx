import * as React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter, Route } from 'react-router-dom';

import Root from '../components/Root';

const RootRouter = () => (
  <BrowserRouter>
    <Route path="/" component={Root} />
  </BrowserRouter>
);

const Routes = process.env.NODE_ENV !== 'production' ? hot(module)(RootRouter) : RootRouter;

export default Routes;
