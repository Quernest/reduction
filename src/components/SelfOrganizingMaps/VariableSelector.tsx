import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React, { ChangeEvent } from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  formControl: {
    minWidth: 100
  }
}));

interface IProps {
  variables: string[];
  currentVariableIndex: number;
  onChangeVariable: (variableIndex: number) => void;
  disabled?: boolean;
}

export const VariableSelector = ({
  variables,
  currentVariableIndex,
  onChangeVariable,
  disabled
}: IProps): JSX.Element => {
  const classes = useStyles();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const variableIndex: number = Number(event.target.value);

    onChangeVariable(variableIndex);
  }

  return (
    <>
      <FormControl fullWidth={true} className={classes.formControl}>
        <InputLabel htmlFor="variable">var</InputLabel>
        <Select
          fullWidth={true}
          disabled={disabled}
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
    </>
  );
};
