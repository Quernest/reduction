import { SvgIconProps } from "@material-ui/core/SvgIcon";
import BookIcon from "@material-ui/icons/Book";
import DashboardIcon from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import TimeLineIcon from "@material-ui/icons/Timeline";
import { RouteProps } from "react-router";
import {
  Docs,
  Home,
  NoMatch,
  PrincipalComponentAnalysis,
  SelfOrganizingMaps
} from "../pages";

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
    component: PrincipalComponentAnalysis,
    icon: TimeLineIcon
  },
  {
    title: "SOM",
    path: "/som",
    component: SelfOrganizingMaps,
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