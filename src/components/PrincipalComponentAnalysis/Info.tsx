import Divider from "@material-ui/core/Divider";
// import List from "@material-ui/core/List";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

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
        Process two-dimensional data arrays using principal component analysis.
      </Typography>
      <Divider className={classes.divider} />
      {/* <Typography variant="body1">
        To use the application you need to do next steps:
      </Typography>
      <List>
        <ListItem disableGutters={true}>
          <ListItemText disableTypography={true}>
            <Typography variant="body1">
              1) Choose and upload your .csv or .txt dataset file
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Note: the first column is reserved under the names of observations
              and the dataset must contain more than 2 variables.
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
      <Divider className={classes.divider} /> */}
    </div>
  );
};
