import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Theme } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import DashboardIcon from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import MenuIcon from "@material-ui/icons/Menu";
import TimeLineIcon from "@material-ui/icons/Timeline";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { redirectTo } from "src/utils/redirectTo";

const useStyles = makeStyles(({ breakpoints }: Theme) => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.md,
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
}));

export const Header = () => {
  const classes = useStyles();

  const [state, setState] = React.useState({
    isOpenDrawer: false
  });

  const toggleDrawer = (open: boolean) => () => {
    setState({ ...state, isOpenDrawer: open });
  };

  return (
    <header className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.wrap}>
            <Grid container={true} alignItems="center">
              <Hidden mdUp={true}>
                <IconButton
                  onClick={toggleDrawer(true)}
                  className={classes.menuButton}
                  color="inherit"
                  aria-label="Menu"
                >
                  <MenuIcon />
                </IconButton>
              </Hidden>
              <Typography variant="h6" color="inherit" className={classes.grow}>
                Reduction
              </Typography>
              <Hidden smDown={true}>
                <Button {...redirectTo("/")} variant="text" color="inherit">
                  Home
                </Button>
                <Button {...redirectTo("/pca")} variant="text" color="inherit">
                  PCA
                </Button>
                <Button {...redirectTo("/som")} variant="text" color="inherit">
                  SOM
                </Button>
              </Hidden>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>
      <Hidden mdUp={true}>
        <SwipeableDrawer
          open={state.isOpenDrawer}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            {
              <div className={classes.list}>
                <List>
                  <ListItem {...redirectTo("/")} button={true}>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                  </ListItem>
                  <ListItem {...redirectTo("/pca")} button={true}>
                    <ListItemIcon>
                      <TimeLineIcon />
                    </ListItemIcon>
                    <ListItemText primary="PCA" />
                  </ListItem>
                  <ListItem {...redirectTo("/som")} button={true}>
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="SOM" />
                  </ListItem>
                </List>
                <Divider />
              </div>
            }
          </div>
        </SwipeableDrawer>
      </Hidden>
    </header>
  );
};
