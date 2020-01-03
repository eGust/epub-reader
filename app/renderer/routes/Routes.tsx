import * as React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter, Route } from 'react-router-dom';

import Home from '../components/Home';

const RootRouter = () => (
  <BrowserRouter>
    <Route path="/" component={Home} />
  </BrowserRouter>
);

const Routes = process.env.NODE_ENV !== 'production' ? hot(module)(RootRouter) : RootRouter;

export default Routes;
