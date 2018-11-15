// @flow

import React, { Fragment } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link,
} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { NotFound } from '../Errors';
import { Home } from '../Home';
import { PCA } from '../PCA';

type Props = {
  classes: Object,
};

const App = ({ classes }: Props) => (
  <div className="App">
    <Router>
      <Fragment>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {/* DRA */}
            </Typography>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/pca/" component={PCA} />
          <Route component={NotFound} />
        </Switch>
      </Fragment>
    </Router>
  </div>
);

const styles = {
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  grow: {
    flexGrow: 1,
  },
};

export default withStyles(styles)(App);
