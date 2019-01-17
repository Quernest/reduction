import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { PrincipalComponentAnalysis, Header, Home } from "./components";

const AppRouter: React.StatelessComponent<{}> = (props: any) => {
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
};

export default AppRouter;
