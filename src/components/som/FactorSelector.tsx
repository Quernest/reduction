import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React from "react";

const useStyles = makeStyles({
  formControl: {
    minWidth: 100
  }
});

interface IFactorSelectorProps {
  factors: string[];
  currentFactorIdx: number;
  onChangeFactor: (factorIdx: number) => void;
  disabled?: boolean;
}

export const FactorSelector: React.FC<IFactorSelectorProps> = ({
  factors,
  currentFactorIdx,
  onChangeFactor,
  disabled
}) => {
  const classes = useStyles();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
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
