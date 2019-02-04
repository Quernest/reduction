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
    flexWrap: "wrap"
  },
  formControl: {
    margin: spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: spacing.unit * 2
  }
}));

interface IProps {
  analysis: number[];
  onChange: (event: any) => void;
  // index of selected component X
  selectedComponentX: number;
  // index of selected component Y
  selectedComponentY: number;
}

export const SelectComponent = ({
  analysis,
  onChange,
  selectedComponentX,
  selectedComponentY
}: IProps) => {
  const classes = useStyles();

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="selectedComponentX">Component X</InputLabel>
        <Select
          value={selectedComponentX}
          onChange={onChange}
          inputProps={{
            name: "selectedComponentX",
            id: "selectedComponentX"
          }}
        >
          {map(analysis, (value: number, index: number) => {
            if (index !== selectedComponentY) {
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
        <InputLabel htmlFor="selectedComponentY">Component Y</InputLabel>
        <Select
          value={selectedComponentY}
          onChange={onChange}
          inputProps={{
            name: "selectedComponentY",
            id: "selectedComponentY"
          }}
        >
          {map(analysis, (value: number, index: number) => {
            if (index !== selectedComponentX) {
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
};

SelectComponent.defaultProps = {
  selectedComponentX: 0,
  selectedComponentY: 1
};
