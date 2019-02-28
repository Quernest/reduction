import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React, { ChangeEvent } from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    minWidth: 150,
    marginTop: spacing.unit,
    marginBottom: spacing.unit * 2
  }
}));

interface IProps {
  variables: string[];
  currentVariableIndex: number;
  onChangeVariable: (variableIndex: number) => void;
}

export function VariableSelector({
  variables,
  currentVariableIndex,
  onChangeVariable
}: IProps): JSX.Element {
  const classes = useStyles();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const variableIndex: number = Number(event.target.value);

    onChangeVariable(variableIndex);
  }

  return (
    <div className={classes.root}>
      <FormControl fullWidth={true} className={classes.formControl}>
        <InputLabel htmlFor="variable">Variable</InputLabel>
        <Select
          value={currentVariableIndex}
          onChange={handleChange}
          inputProps={{
            id: "variable"
          }}
        >
          {variables &&
            map(variables, (variable, i) => (
              <MenuItem value={i} key={i}>
                {variable}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
}