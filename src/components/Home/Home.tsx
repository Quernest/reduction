import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

export interface Props {
  classes?: any;
}

const Home = ({ classes }: Props) => (
  <div className={classes.root}>
    <Grid container justify="center">
      <Grid className={classes.grid} container alignItems="center">
        <Button
          component={props => <Link {...props as LinkProps} to="/pca" />}
          variant="contained"
        >
          Principal Component Analysis
        </Button>
      </Grid>
    </Grid>
  </div>
);

const styles = ({ spacing, breakpoints }: Theme) => createStyles({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up('sm')]: {
      padding: spacing.unit * 3,
    },
  },
  grid: {
    [breakpoints.up('md')]: {
      width: breakpoints.values.md,
    },
  },
});

export default withStyles(styles)(Home);
