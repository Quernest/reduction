import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrincipalComponentAnalysis from './components/PrincipalComponentAnalysis';
import Header from './components/Header';
import Home from './components/Home';

function AppRouter() {
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

export default AppRouter;
