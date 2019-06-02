import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from 'react-i18next';
import React from "react";
import {
  DatasetControls,
  Table,
  generateColumns,
  generateRows
} from "../../components";
import { IDatasetRequiredColumnsIndexes, IParsedFile } from "../../models";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: theme.spacing(1)
  },
  buttonWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

interface ICalculateControlsProps {
  calculating?: boolean;
  parsedFile: IParsedFile;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  onCalculate: () => void;
  onChangeDatasetRequiredColumns: (
    newDatasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) => void;
}

export const CalculateControls: React.FC<ICalculateControlsProps> = ({
  calculating,
  parsedFile,
  onChangeDatasetRequiredColumns,
  datasetRequiredColumnsIdxs,
  onCalculate
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  /**
   * title outside for updating
   * if language is changed
   */
  const datasetTableTitle = t('dataset');

  const DatasetTable = React.useMemo(() => {
    const columns = generateColumns(parsedFile.columns);
    const rows = generateRows(parsedFile.rows, parsedFile.columns);

    return <Table title={datasetTableTitle} rows={rows} columns={columns} />;
  }, [parsedFile, datasetTableTitle]);

  return (
    <div className={classes.root}>
      <Grid container={true} alignItems="center" spacing={2}>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              color="primary"
              disabled={calculating}
              onClick={onCalculate}
              fullWidth={true}
            >
              {t('controls.calculate.button')}
            </Button>
            {calculating && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
        <Grid item={true} xs={12}>
          <DatasetControls
            rows={parsedFile.rows}
            columns={parsedFile.columns}
            onChange={onChangeDatasetRequiredColumns}
            datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
          />
        </Grid>
        <Grid item={true} xs={12}>
          {DatasetTable}
        </Grid>
      </Grid>
    </div>
  );
};
