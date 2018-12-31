// @flow
import React from 'react';
import type { Node } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { App, PrincipalComponentAnalysis } from './components';

function AppRouter(): Node {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/pca" component={PrincipalComponentAnalysis} />
      </Switch>
    </Router>
  );
}

export default hot(AppRouter);
