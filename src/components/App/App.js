// @flow

import React, { Fragment } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link,
} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { NotFound } from '../Errors';
import { Home } from '../Home';
import { PCA } from '../PCA';
import styles from './styles';

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

export default withStyles(styles)(App);
