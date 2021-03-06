import { Theme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import isUndefined from "lodash/isUndefined";
import { useTranslation } from 'react-i18next';
import map from "lodash/map";
import React from "react";
import { IDatasetRequiredColumnsIndexes } from "../../models";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  formControl: {
    minWidth: 100
  }
}));

interface IDatasetControlsProps {
  rows: any[];
  columns: any[];
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  onChange: (
    newDatasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) => void;
  disabled?: boolean;
}

export const DatasetControls: React.FC<IDatasetControlsProps> = ({
  rows,
  columns,
  datasetRequiredColumnsIdxs,
  onChange,
  disabled
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;

    onChange({
      ...datasetRequiredColumnsIdxs,
      [name]: value !== "" ? value : undefined
    });
  }

  return (
    <div className={classes.root}>
      <form autoComplete="off">
        <Grid container={true} spacing={2}>
          <Grid item={true} xs={6} sm={4} md={3} lg={2}>
            <FormControl
              required={true}
              fullWidth={true}
              className={classes.formControl}
            >
              <InputLabel htmlFor="observationsIdx">{t('controls.dataset.observations')}</InputLabel>
              <Select
                fullWidth={true}
                disabled={disabled}
                value={datasetRequiredColumnsIdxs.observationsIdx}
                required={true}
                onChange={handleChange}
                inputProps={{
                  id: "observationsIdx",
                  name: "observationsIdx"
                }}
              >
                {columns &&
                  map(
                    columns,
                    (column, i) =>
                      i !== datasetRequiredColumnsIdxs.typesIdx && (
                        <MenuItem value={i} key={i}>
                          {column}
                        </MenuItem>
                      )
                  )}
              </Select>
              <FormHelperText>{t('controls.dataset.requiredHelperText')}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item={true} xs={6} sm={4} md={3} lg={2}>
            <FormControl fullWidth={true} className={classes.formControl}>
              <InputLabel htmlFor="typesIdx">{t('controls.dataset.types')}</InputLabel>
              <Select
                fullWidth={true}
                disabled={disabled}
                value={
                  isUndefined(datasetRequiredColumnsIdxs.typesIdx)
                    ? ""
                    : datasetRequiredColumnsIdxs.typesIdx
                }
                onChange={handleChange}
                inputProps={{
                  id: "typesIdx",
                  name: "typesIdx"
                }}
              >
                <MenuItem value="">
                  <em>{t('controls.dataset.noneHelperText')}</em>
                </MenuItem>
                {columns &&
                  map(
                    columns,
                    (column, i) =>
                      i !== datasetRequiredColumnsIdxs.observationsIdx && (
                        <MenuItem value={i} key={i}>
                          {column}
                        </MenuItem>
                      )
                  )}
              </Select>
              <FormHelperText>{t('controls.dataset.optionalHelperText')}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};
