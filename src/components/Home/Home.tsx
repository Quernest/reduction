import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { redirectTo } from "src/utils/redirectTo";

const styles = ({ spacing, breakpoints }: Theme): StyleRules =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: spacing.unit * 2,
      [breakpoints.up("sm")]: {
        padding: spacing.unit * 3
      }
    },
    wrap: {
      width: "100%",
      maxWidth: breakpoints.values.md,
      marginLeft: "auto",
      marginRight: "auto"
    }
  });

interface IProps {
  classes?: any;
}

export const Home = withStyles(styles)(({ classes }: IProps) => (
  <div className={classes.root}>
    <div className={classes.wrap}>
      <Grid container={true} alignItems="flex-start" spacing={24}>
        <Grid item={true} xs={12} md={6}>
          <Typography variant="h6" paragraph={true}>
            Principal Component Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph={true}>
            Principal component analysis (PCA) is a statistical procedure that
            uses an orthogonal transformation to convert a set of observations
            of possibly correlated variables (entities each of which takes on
            various numerical values) into a set of values of linearly
            uncorrelated variables called principal components.
          </Typography>
          <Button {...redirectTo("/pca")} color="primary" variant="contained">
            Try it
          </Button>
        </Grid>
        <Grid item={true} xs={12} md={6}>
          <Typography variant="h6" paragraph={true}>
            Self-Organizing Map
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph={true}>
            A self-organizing map (SOM) or self-organizing feature map (SOFM) is
            a type of artificial neural network (ANN) that is trained using
            unsupervised learning to produce a low-dimensional (typically
            two-dimensional), discretized representation of the input space of
            the training samples, called a map, and is therefore a method to do
            dimensionality reduction.
          </Typography>
          <Button {...redirectTo("/som")} color="primary" variant="contained">
            Try it
          </Button>
        </Grid>
      </Grid>
    </div>
  </div>
));
