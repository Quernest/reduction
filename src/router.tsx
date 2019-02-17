import * as React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "./components";
import {
  Home,
  NoMatch,
  PrincipalComponentAnalysis,
  SelfOrganizingMaps
} from "./pages";

/**
 * AppRouter is component which contains all page routes
 * and provide a wrapper for the react-router-dom library
 * @param props any
 */
export const AppRouter = (props: any): JSX.Element => {
  return (
    <Router>
      <>
        <Header />
        <Switch>
          <Route path="/" exact={true} component={Home} />
          <Route path="/pca" component={PrincipalComponentAnalysis} />
          <Route path="/som" component={SelfOrganizingMaps} />
          <Route component={NoMatch} />
        </Switch>
      </>
    </Router>
  );
};
