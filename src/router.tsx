import * as React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "./components";
import { Home, Page404, PrincipalComponentAnalysisPage } from "./pages";

/**
 * AppRouter is component which contains all page routes
 * and provide a wrapper for the react-router-dom library
 * @param props any
 */
export const AppRouter: React.StatelessComponent<{}> = (props: any) => {
  return (
    <Router>
      <React.Fragment>
        <Header />
        <Switch>
          <Route path="/" exact={true} component={Home} />
          <Route path="/pca" component={PrincipalComponentAnalysisPage} />
          <Route component={Page404} />
        </Switch>
      </React.Fragment>
    </Router>
  );
};
