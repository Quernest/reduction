import Button from "@material-ui/core/Button";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import * as math from "mathjs";
import React, { useMemo, useState } from "react";
import { OutputTable } from "src/components/Tables";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: spacing.unit
  },
  tableBox: {
    flexGrow: 1,
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 3
  },
  tables: {
    flexGrow: 1
  },
  analysisInfo: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2
  }
}));

interface IProps {
  parsedFile: IParsedCSV;
  calculations: IPCACalculations;
}

export const Calculations = ({
  parsedFile,
  calculations
}: IProps): JSX.Element => {
  const classes = useStyles();
  const {
    adjustedDataset,
    covariance,
    eigens,
    analysis: {
      proportion,
      totalProportion,
      importantComponentsVariance,
      importantComponents,
      amountOfImportantComponents,
      differences,
      cumulative
    },
    linearCombinations
  } = calculations;
  const { tailedVariables, variables, observations, values } = parsedFile;
  const [onlyImportantComponents, showImportantComponents] = useState<boolean>(
    false
  );

  function toggleImportantComponents() {
    showImportantComponents(!onlyImportantComponents);
  }

  function tableFilter(
    components: number[] = [],
    arr: any[] = [],
    hasFirstColumn?: boolean
  ) {
    if (!components || components.length === 0) {
      return arr;
    }

    const offset = hasFirstColumn ? 1 : 0;
    const filtered = [];

    if (hasFirstColumn) {
      filtered.push(arr[0]);
    }

    components.forEach(component => {
      filtered.push(arr[component + offset]);
    });

    return filtered;
  }

  const datasetTable = useMemo(() => {
    const rows = [observations, ...values];
    const columns = variables;

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Dataset
        </Typography>
        <OutputTable rows={rows} columns={columns} />
      </div>
    );
  }, [observations, values, variables]);

  const adjustedDatasetTable = useMemo(() => {
    const rows = [observations, ...adjustedDataset];
    const columns = variables;

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Adjusted dataset
        </Typography>
        <OutputTable rows={rows} columns={columns} />
      </div>
    );
  }, [observations, adjustedDataset, variables]);

  const covariationMatrixTable = useMemo(() => {
    const rows = covariance;
    const columns = tailedVariables;

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Covariation matrix
        </Typography>
        <OutputTable rows={rows} columns={columns} />
      </div>
    );
  }, [covariance, tailedVariables]);

  const EigenanalysisTable = useMemo(() => {
    const rows = [eigens.lambda.x, differences, proportion, cumulative];
    const columns = [
      "Eigenvalue",
      "Difference b/n eigenvalues",
      "Proportion of variance explained, %",
      "Cumulative proportion of variance explained, %"
    ];

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Eigenanalysis of the covariation matrix
        </Typography>
        <div className={classes.analysisInfo}>
          <Typography variant="body2" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{tailedVariables.length}</strong>
          </Typography>
          <Typography variant="body2" gutterBottom={true}>
            All <strong>{tailedVariables.length}</strong> components explain{" "}
            <strong>{totalProportion}%</strong> variation of the data
          </Typography>
          <Typography variant="body2" gutterBottom={true}>
            <strong>{amountOfImportantComponents}</strong> component
            {amountOfImportantComponents > 1 ? "s" : ""} have eigenvalue
            {amountOfImportantComponents > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>{importantComponentsVariance}%</strong> of variation.
          </Typography>
        </div>
        <OutputTable
          enumerateSymbol="Component"
          rows={rows}
          columns={columns}
        />
      </div>
    );
  }, [
    eigens.lambda.x,
    differences,
    proportion,
    totalProportion,
    cumulative,
    amountOfImportantComponents,
    importantComponentsVariance
  ]);

  const loadingsTable = useMemo(() => {
    const rows = [
      tailedVariables,
      ...(math.transpose(eigens.E.x) as number[][])
    ];

    const columns = map(["Loadings", ...tailedVariables], (variable, i) =>
      i === 0 ? variable : `PC${i}`
    );

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Component loadings
        </Typography>
        <OutputTable
          rows={
            onlyImportantComponents
              ? tableFilter(importantComponents, rows, true)
              : rows
          }
          columns={
            onlyImportantComponents
              ? tableFilter(importantComponents, columns, true)
              : columns
          }
        />
      </div>
    );
  }, [eigens.E.x, tailedVariables, onlyImportantComponents]);

  const predictedValuesTable = useMemo(() => {
    const rows = [observations, ...linearCombinations];

    const columns = map(variables, (variable, i) =>
      i === 0 ? variable : `PC${i}`
    );

    return (
      <div className={classes.tableBox}>
        <Typography className={classes.tableTitle} variant="body1">
          Predicted principal components
        </Typography>
        <OutputTable
          rows={
            onlyImportantComponents
              ? tableFilter(importantComponents, rows, true)
              : rows
          }
          columns={
            onlyImportantComponents
              ? tableFilter(importantComponents, columns, true)
              : columns
          }
        />
      </div>
    );
  }, [observations, variables, linearCombinations, onlyImportantComponents]);

  return (
    <div className={classes.root}>
      <div className={classes.tables}>
        {datasetTable}
        {adjustedDatasetTable}
        {covariationMatrixTable}
        {EigenanalysisTable}
        <Button
          variant="contained"
          color="primary"
          onClick={toggleImportantComponents}
        >
          {onlyImportantComponents
            ? "show unimportant components"
            : "hide unimportant components"}
        </Button>
        {loadingsTable}
        {predictedValuesTable}
      </div>
    </div>
  );
};
