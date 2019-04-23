import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import {
  DatasetControls,
  Table,
  generateColumns,
  generateRows
} from "../../components";
import { IDatasetRequiredColumnsIndexes, IParsedFile } from "../../models";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: spacing.unit
  },
  buttonWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: palette.primary.main,
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

  const DatasetTable = React.useMemo(() => {
    const columns = generateColumns(parsedFile.columns);
    const rows = generateRows(parsedFile.rows, parsedFile.columns);

    return <Table title="Dataset preview" rows={rows} columns={columns} />;
  }, [parsedFile]);

  return (
    <div className={classes.root}>
      <Typography variant="body1" paragraph={true}>
        The dataset is processed. Press on the calculate button
      </Typography>
      <Grid container={true} alignItems="center" spacing={16}>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              color="primary"
              disabled={calculating}
              onClick={onCalculate}
              fullWidth={true}
            >
              Calculate
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
