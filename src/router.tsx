import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  PrincipalComponentAnalysisPage,
  Header,
  Home
} from "./components/index";

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
        </Switch>
      </React.Fragment>
    </Router>
  );
};
