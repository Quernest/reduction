import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import Typography from '@material-ui/core/Typography';
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import IconLanguage from '@material-ui/icons/Language';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import MenuIcon from "@material-ui/icons/Menu";
import Popover from '@material-ui/core/Popover';
import { makeStyles } from "@material-ui/styles";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { withRouter, RouteComponentProps } from "react-router-dom";
import { IRoute } from "../router";

const useStyles = makeStyles({
  menuButton: {
    marginLeft: -12
  },
  list: {
    width: 250
  },
  right: {
    marginLeft: "auto"
  }
});

interface IHeaderProps extends RouteComponentProps {
  routes: IRoute[];
}

export const HeaderBase: React.FC<IHeaderProps> = ({ routes, location }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [isOpenDrawer, toggleDrawer] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  function handleClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleChangeLanguage(lng: string) {
    i18n.changeLanguage(lng);
    handleClose();
  }

  const open = Boolean(anchorEl);
  const id = open ? 'lng-popover' : undefined;

  const links = routes.map(({ path }, i) => {
    if (path) {
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
          {t(`navigation.${path}`) || ""}
        </Button>
      );
    }

    return null;
  });

  const drawerLinks = routes.map(({ path, icon }, i) => {
    if (path && icon) {
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
          <ListItemText primary={t(`navigation.${path}`)} />
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
            <Tooltip title={t('changeLanguage')}>
              <IconButton color="inherit" aria-describedby={id} onClick={handleClick}>
                <IconLanguage color="inherit" />
              </IconButton>
            </Tooltip>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <List component="nav" dense={true}>
                <ListItem button={true} onClick={() => handleChangeLanguage('en')}>
                  <ListItemText disableTypography={true}>
                    <Typography component="span"><small>us</small> English</Typography>
                  </ListItemText>
                </ListItem>
                <ListItem button={true} onClick={() => handleChangeLanguage('uk')}>
                  <ListItemText disableTypography={true}>
                    <Typography component="span"><small>uk</small> Українська</Typography>
                  </ListItemText>
                </ListItem>
              </List>
            </Popover>
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
