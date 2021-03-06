import map from "lodash/map";
import * as React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header } from "./components";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import BookIcon from "@material-ui/icons/Book";
import DashboardIcon from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import MultilineChartIcon from "@material-ui/icons/MultilineChart";
import { RouteProps } from "react-router";
import { NoMatch, PCAPage, HomePage, DocsPage, SOMPage } from "./pages";

export interface IRoute extends RouteProps {
  icon?: React.ComponentType<SvgIconProps>;
}

export const routes: IRoute[] = [
  {
    exact: true,
    path: "/",
    component: HomePage,
    icon: HomeIcon
  },
  {
    path: "/pca",
    component: PCAPage,
    icon: MultilineChartIcon
  },
  {
    path: "/som",
    component: SOMPage,
    icon: DashboardIcon
  },
  {
    path: "/docs",
    component: DocsPage,
    icon: BookIcon
  },
  {
    component: NoMatch
  }
];

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
