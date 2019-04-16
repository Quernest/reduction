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
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import { IRoute } from "src/router";

const styles = ({ breakpoints }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    grow: {
      flexGrow: 1
    },
    wrap: {
      width: "100%",
      maxWidth: breakpoints.values.lg,
      marginLeft: "auto",
      marginRight: "auto"
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    list: {
      width: 250
    }
  });

interface IHeaderBaseProps extends WithStyles<typeof styles> {
  routes: IRoute[];
  location: Location;
}

interface IHeaderBaseState {
  isOpenDrawer: boolean;
}

class HeaderBase extends React.Component<IHeaderBaseProps, IHeaderBaseState> {
  public readonly state = {
    isOpenDrawer: false
  };

  protected toggleDrawer = (isOpenDrawer: boolean) => () => {
    this.setState({
      isOpenDrawer
    });
  };

  public render() {
    const { classes, location, routes } = this.props;
    const { isOpenDrawer } = this.state;

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
              <Icon
                color={path === location.pathname ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary={title} />
          </ListItem>
        );
      }

      return null;
    });

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <div className={classes.wrap}>
              <Grid container={true} alignItems="center">
                <Hidden mdUp={true}>
                  <IconButton
                    onClick={this.toggleDrawer(true)}
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="Menu"
                  >
                    <MenuIcon />
                  </IconButton>
                </Hidden>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classes.grow}
                >
                  Reduction
                </Typography>
                <Hidden smDown={true}>{links}</Hidden>
              </Grid>
            </div>
          </Toolbar>
        </AppBar>
        <Hidden mdUp={true}>
          <Drawer open={isOpenDrawer} onClose={this.toggleDrawer(false)}>
            <div
              tabIndex={0}
              role="button"
              onClick={this.toggleDrawer(false)}
              onKeyDown={this.toggleDrawer(false)}
            >
              <div className={classes.list}>
                <List>{drawerLinks}</List>
                <Divider />
              </div>
            </div>
          </Drawer>
        </Hidden>
      </div>
    );
  }
}

export const Header = compose<IHeaderBaseProps, any>(
  withRouter,
  withStyles(styles)
)(HeaderBase);
