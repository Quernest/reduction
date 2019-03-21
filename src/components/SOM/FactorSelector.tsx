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
  factors: string[];
  currentFactorIdx: number;
  onChangeFactor: (factorIdx: number) => void;
  disabled?: boolean;
}

export const FactorSelector = ({
  factors,
  currentFactorIdx,
  onChangeFactor,
  disabled
}: IProps): JSX.Element => {
  const classes = useStyles();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const idx: number = Number(event.target.value);

    onChangeFactor(idx);
  }

  return (
    <>
      <FormControl fullWidth={true} className={classes.formControl}>
        <InputLabel htmlFor="factor">factor</InputLabel>
        <Select
          fullWidth={true}
          disabled={disabled}
          value={currentFactorIdx}
          onChange={handleChange}
          inputProps={{
            id: "factor"
          }}
        >
          {factors &&
            map(factors, (factor, i) => (
              <MenuItem value={i} key={i}>
                {factor}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
};
