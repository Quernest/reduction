import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";

const useStyles = makeStyles(({ breakpoints, spacing }: Theme) => ({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up("sm")]: {
      padding: spacing.unit * 3
    }
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.lg,
    marginLeft: "auto",
    marginRight: "auto"
  },
  divider: {
    marginBottom: spacing.unit * 3
  },
  blockquote: {
    margin: `${spacing.unit * 3}px 0px`,
    padding: `${spacing.unit / 2}px ${spacing.unit * 3}px`,
    borderLeft: "5px solid rgba(0, 0, 0, 0.38)"
  },
  blockquoteText: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2
  }
}));

export const DocsPage = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h1" gutterBottom={true}>
          Documentation
        </Typography>
        <Divider className={classes.divider} />
        <blockquote className={classes.blockquote}>
          <Typography variant="body1" className={classes.blockquoteText}>
            Documentation is incomplete and gradually updated
          </Typography>
        </blockquote>
        <Divider className={classes.divider} />
        <Typography variant="h2" gutterBottom={true}>
          Dataset
        </Typography>
        <Typography variant="body1" paragraph={true}>
          This application uses{" "}
          <Link href="https://en.wikipedia.org/wiki/Comma-separated_values">
            Comma-Separated Values
          </Link>{" "}
          format as default.
        </Typography>
        <Typography variant="body1" color="secondary" paragraph={true}>
          <Typography inline={true} variant="button" color="secondary">
            important:
          </Typography>{" "}
          The data in the CSV file needs to be formatted according to specific
          requirements
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" gutterBottom={true}>
              the number of factors must be equal to or more than 2 (taking into
              account the variable with observations and types if types are
              indicated)
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom={true}>
              the number of observations must be equal to or more than 2
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom={true}>
              all values ​​must be numeric, unless observations and types
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom={true}>
              empty values are not allowed
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" paragraph={true}>
          To review an example of valid CSV data, download the following ZIP
          file:{" "}
          <Link href="https://gist.github.com/Quernest/d8b8d8be49c6acbbe00ea8cd0f2f16c2/archive/99c522cf29f2a2c764e6c814de8165c07c8a0975.zip">
            Sample CSV data
          </Link>
          . The ZIP file contains 3 datasets. Two of them (wines) describes five
          wines described by the average ratings of a set of experts on their
          hedonic dimension, how much the wine goes with dessert, and how much
          the wine goes with meat. Each wine is also described by its price, its
          sugar and alcohol content, and its acidity. Another describes gross
          state product from Lattin, Carroll, and Green (2003). Data are for 50
          observations (U.S. states) and 13 categories (ag, mining, trade, etc.)
          for the gross state product expressed as shares.
        </Typography>
      </div>
    </div>
  );
};
