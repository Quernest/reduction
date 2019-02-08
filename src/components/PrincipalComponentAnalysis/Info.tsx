import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexGrow: 1
  },
  divider: {
    marginBottom: spacing.unit * 2
  }
}));

export const Info = (): JSX.Element => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Divider className={classes.divider} />
      <Typography variant="body1" paragraph={true}>
        This calculator is designed to process two-dimensional data arrays using
        the principal component analysis algorithm.
      </Typography>
      <Typography variant="body1">
        To use the calculator you need to do next steps:
      </Typography>
      <List>
        <ListItem disableGutters={true}>
          <ListItemText disableTypography={true}>
            <Typography variant="body1">
              1) Choose and upload your .csv or .txt dataset file
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Note: the dataset must contain more than 2 factors
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem disableGutters={true}>
          <ListItemText disableTypography={true}>
            <Typography variant="body1">
              2) In case of a parsing error, eliminate and reload the data
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem disableGutters={true}>
          <ListItemText disableTypography={true}>
            <Typography variant="body1">
              3) Press on the calculate button
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Note: do not forget to make sure that the dataset is processed
              correctly
            </Typography>
          </ListItemText>
        </ListItem>
        <ListItem disableGutters={true}>
          <ListItemText disableTypography={true}>
            <Typography variant="body1">
              4) After performing the calculations, represent the dataset using
              the visualize button
            </Typography>
          </ListItemText>
        </ListItem>
      </List>
      <Divider className={classes.divider} />
      <Typography variant="body1" paragraph={true}>
        Download the{" "}
        <Link
          href="https://www.dropbox.com/s/pw0lq6adggjo5sy/gsp.csv?dl=0"
          variant="inherit"
          color="primary"
        >
          example dataset
        </Link>{" "}
        and try it now
      </Typography>
      <Divider className={classes.divider} />
    </div>
  );
};
