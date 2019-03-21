import { SvgIconProps } from "@material-ui/core/SvgIcon";
import BookIcon from "@material-ui/icons/Book";
import DashboardIcon from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import MultilineChartIcon from "@material-ui/icons/MultilineChart";
import { RouteProps } from "react-router";
import { Docs, Home, NoMatch, PCAPage, SOMPage } from "../pages";

export interface IRoute extends RouteProps {
  title?: string;
  icon?: React.ComponentType<SvgIconProps>;
}

export const routes: IRoute[] = [
  {
    exact: true,
    path: "/",
    title: "Home",
    component: Home,
    icon: HomeIcon
  },
  {
    path: "/pca",
    title: "PCA",
    component: PCAPage,
    icon: MultilineChartIcon
  },
  {
    title: "SOM",
    path: "/som",
    component: SOMPage,
    icon: DashboardIcon
  },
  {
    title: "Docs",
    path: "/docs",
    component: Docs,
    icon: BookIcon
  },
  {
    component: NoMatch
  }
];
