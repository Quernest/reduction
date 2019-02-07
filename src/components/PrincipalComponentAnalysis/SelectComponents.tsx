import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Theme } from "@material-ui/core/styles";
import ThreeSixtyIcon from "@material-ui/icons/ThreeSixty";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: spacing.unit,
    marginTop: spacing.unit
  },
  formControl: {
    marginRight: spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: spacing.unit * 2
  },
  iconButton: {
    padding: spacing.unit,
    marginRight: spacing.unit
  },
  icon: {
    fontSize: 24
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

  const onSwap = (event: any) => {
    const x: number = components.y;
    const y: number = components.x;

    onChange({ x, y });
  };

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="x">Component X</InputLabel>
        <Select
          value={components.x}
          onChange={onChangeSelect}
          disabled={analysis.length === 2}
          inputProps={{
            name: "x",
            id: "x"
          }}
        >
          {map(
            analysis,
            (value: number, i: number) =>
              i !== components.y && (
                <MenuItem key={i} value={i}>
                  PC{i + 1} ({value}%)
                </MenuItem>
              )
          )}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="y">Component Y</InputLabel>
        <Select
          value={components.y}
          onChange={onChangeSelect}
          disabled={analysis.length === 2}
          inputProps={{
            name: "y",
            id: "y"
          }}
        >
          {map(
            analysis,
            (value: number, i: number) =>
              i !== components.x && (
                <MenuItem key={i} value={i}>
                  PC{i + 1} ({value}%)
                </MenuItem>
              )
          )}
        </Select>
      </FormControl>
      <IconButton
        aria-label="Swap"
        onClick={onSwap}
        className={classes.iconButton}
      >
        <ThreeSixtyIcon className={classes.icon} />
      </IconButton>
    </form>
  );
};

SelectComponents.defaultProps = {
  components: {
    x: 0,
    y: 1
  }
};
