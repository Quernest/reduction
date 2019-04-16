import map from "lodash/map";
import * as React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "src/components";
import { routes } from "./";

export const AppRouter = () => {
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
