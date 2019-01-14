// @flow
import React from 'react';
import type { Node } from 'react';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header, Home, PrincipalComponentAnalysis } from './components';

function AppRouter(): Node {
  return (
    <Router>
      <React.Fragment>
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/pca" component={PrincipalComponentAnalysis} />
        </Switch>
      </React.Fragment>
    </Router>
  );
}

export default hot(AppRouter);
