import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: spacing.unit,
    marginTop: spacing.unit
  },
  formControl: {
    marginRight: spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: spacing.unit * 2
  }
}));

interface IProps {
  analysis: number[];
  components: {
    x: number;
    y: number;
  };
  onChange: (newComponents: { x: number; y: number }) => void;
}

export const SelectComponents = ({
  analysis,
  onChange,
  components
}: IProps) => {
  const classes = useStyles();

  const onChangeSelect = (event: any) => {
    const { name, value } = event.target;

    onChange({ ...components, [name]: value });
  };

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="x">Component X</InputLabel>
        <Select
          value={components.x}
          onChange={onChangeSelect}
          inputProps={{
            name: "x",
            id: "x"
          }}
        >
          {map(analysis, (value: number, i: number) => {
            if (i !== components.y) {
              return (
                <MenuItem key={i} value={i}>
                  PC {i + 1} {value}%
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
          value={components.y}
          onChange={onChangeSelect}
          inputProps={{
            name: "y",
            id: "y"
          }}
        >
          {map(analysis, (value: number, i: number) => {
            if (i !== components.x) {
              return (
                <MenuItem key={i} value={i}>
                  PC {i + 1} {value}%
                </MenuItem>
              );
            }

            return null;
          })}
        </Select>
      </FormControl>
    </form>
  );
};

SelectComponents.defaultProps = {
  components: {
    x: 0,
    y: 1
  }
};
