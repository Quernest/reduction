import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/styles";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { IRoute } from "../router";

const useStyles = makeStyles(({ breakpoints }: Theme) => ({
  menuButton: {
    marginLeft: -12
  },
  list: {
    width: 250
  },
  right: {
    marginLeft: "auto"
  }
}));

interface IHeaderProps extends RouteComponentProps {
  routes: IRoute[];
}

export const HeaderBase: React.FC<IHeaderProps> = ({ routes, location }) => {
  const classes = useStyles();
  const [isOpenDrawer, toggleDrawer] = useState<boolean>(false);

  const links = routes.map(({ path, title }, i) => {
    if (path && title) {
      return (
        <Button
          key={i}
          {...{
            component: Link,
            to: path,
            replace: path === location.pathname
          } as any}
          variant="text"
          color="inherit"
        >
          {title || ""}
        </Button>
      );
    }

    return null;
  });

  const drawerLinks = routes.map(({ path, title, icon }, i) => {
    if (path && title && icon) {
      const Icon = icon;

      return (
        <ListItem
          key={i}
          {...{
            component: Link,
            to: path,
            replace: path === location.pathname
          } as any}
          button={true}
        >
          <ListItemIcon>
            <Icon color={path === location.pathname ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItem>
      );
    }

    return null;
  });

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Grid container={true} alignItems="center">
            <Hidden mdUp={true}>
              <IconButton
                onClick={() => toggleDrawer(true)}
                className={classes.menuButton}
                color="inherit"
                aria-label="Menu"
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden smDown={true}>
              <div className={classes.right}>{links}</div>
            </Hidden>
          </Grid>
        </Toolbar>
      </AppBar>
      <Hidden mdUp={true}>
        <Drawer open={isOpenDrawer} onClose={() => toggleDrawer(false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={() => toggleDrawer(false)}
            onKeyDown={() => toggleDrawer(false)}
          >
            <div className={classes.list}>
              <List>{drawerLinks}</List>
              <Divider />
            </div>
          </div>
        </Drawer>
      </Hidden>
    </React.Fragment>
  );
};

export const Header = withRouter(HeaderBase);
