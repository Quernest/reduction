import map from "lodash/map";
import * as React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "src/components";
import { routes } from "./";

/**
 * AppRouter is component which contains all page routes
 * and provide a wrapper for the react-router-dom library
 * @param props any
 */
export const AppRouter = (props: any): JSX.Element => {
  const routeComponents = map(routes, (route, i) => (
    <Route key={i} {...route} />
  ));

  return (
    <Router>
      <>
        <Header routes={routes} />
        <Switch>{routeComponents}</Switch>
      </>
    </Router>
  );
};
