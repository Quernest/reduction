import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import React from "react";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const idx: number = Number(event.target.value);

    onChangeFactor(idx);
  }

  return (
    <React.Fragment>
      <FormControl fullWidth={true} className={classes.formControl}>
        <InputLabel htmlFor="factor">{t('variable')}</InputLabel>
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
    </React.Fragment>
  );
};
