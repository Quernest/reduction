// @flow
import React from 'react';
import type { Node } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header, HomePage, PrincipalComponentAnalysis } from './components';

function AppRouter(): Node {
  return (
    <Router>
      <>
        <Header />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/pca" component={PrincipalComponentAnalysis} />
        </Switch>
      </>
    </Router>
  );
}

export default hot(AppRouter);
