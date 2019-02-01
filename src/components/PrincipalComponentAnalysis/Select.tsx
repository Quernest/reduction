import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { StyleRules, Theme, withStyles } from "@material-ui/core/styles";
import map from "lodash/map";
import React from "react";

const styles = (theme: Theme): StyleRules => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
});

interface IProps {
  classes?: any;
  analysis: number[];
  onChange: (event: any) => void;
  x: number;
  y: number;
}

export const SelectComponent = withStyles(styles)(
  class extends React.Component<IProps> {
    public static readonly defaultProps = {
      x: 0,
      y: 1
    };

    public render() {
      const { classes, analysis, onChange, x, y } = this.props;

      return (
        <form className={classes.root} autoComplete="off">
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="x">Component X</InputLabel>
            <Select
              value={x}
              onChange={onChange}
              inputProps={{
                name: "x",
                id: "x"
              }}
            >
              {map(analysis, (value: number, index: number) => {
                if (index !== y) {
                  return (
                    <MenuItem key={index} value={index}>
                      PC {index + 1} {value}%
                    </MenuItem>
                  );
                }

                return null;
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="y">Component Y</InputLabel>
            <Select
              value={y}
              onChange={onChange}
              inputProps={{
                name: "y",
                id: "y"
              }}
            >
              {map(analysis, (value: number, index: number) => {
                if (index !== x) {
                  return (
                    <MenuItem key={index} value={index}>
                      PC {index + 1} {value}%
                    </MenuItem>
                  );
                }

                return null;
              })}
            </Select>
          </FormControl>
        </form>
      );
    }
  }
);
