import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import filter from "lodash/filter";
import includes from "lodash/includes";
import isUndefined from "lodash/isUndefined";
import round from "lodash/round";
import unzip from "lodash/unzip";
import React, { useMemo } from "react";
import { DXTable, generateColumns, generateRows } from "src/components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IPCACalculations
} from "src/models";
import { insert } from "src/utils";

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
  dataset: IDataset;
  calculations: IPCACalculations;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
}

export const Calculations = ({
  dataset,
  calculations,
  datasetRequiredColumnsIdxs: { observationsIdx, typesIdx }
}: IProps): JSX.Element => {
  const classes = useStyles();
  const {
    adjustedDataset,
    covariance,
    eigens,
    analysis: {
      proportion,
      totalProportion,
      importantComponents,
      importantComponentsVariance,
      differences,
      components,
      cumulative
    },
    linearCombinations
  } = calculations;
  const { factors, variables, types, observations, values } = dataset;

  const DatasetTable = useMemo(() => {
    let rowsValues = [...values];

    /**
     * there is a substitution of columns for variables,
     * if a variable with the selected type exists and it
     * is after the observation variable, then we insert
     * the array of types first, if not otherwise
     *
     * it is necessary for the correct position
     * todo: improve this code
     */
    if (!isUndefined(typesIdx) && types) {
      if (observationsIdx > typesIdx) {
        rowsValues = insert(rowsValues, typesIdx, types);
        rowsValues = insert(rowsValues, observationsIdx, observations);
      } else {
        rowsValues = insert(rowsValues, observationsIdx, observations);
        rowsValues = insert(rowsValues, typesIdx, types);
      }
    } else {
      /**
       * add observations to the specific position
       */
      rowsValues = insert(rowsValues, observationsIdx, observations);
    }

    const columns = generateColumns(variables);
    const rows = generateRows(rowsValues, variables);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Original dataset" rows={rows} columns={columns} />
      </div>
    );
  }, [observations, values, types, variables]);

  const AdjustedDatasetTable = useMemo(() => {
    let rowsValues = [...adjustedDataset];

    /**
     * there is a substitution of columns for variables,
     * if a variable with the selected type exists and it
     * is after the observation variable, then we insert
     * the array of types first, if not otherwise
     *
     * it is necessary for the correct position
     * todo: improve this code
     */
    if (!isUndefined(typesIdx) && types) {
      if (observationsIdx > typesIdx) {
        rowsValues = insert(rowsValues, typesIdx, types);
        rowsValues = insert(rowsValues, observationsIdx, observations);
      } else {
        rowsValues = insert(rowsValues, observationsIdx, observations);
        rowsValues = insert(rowsValues, typesIdx, types);
      }
    } else {
      /**
       * add observations to the specific position
       */
      rowsValues = insert(rowsValues, observationsIdx, observations);
    }

    const columns = generateColumns(variables);
    const rows = generateRows(rowsValues, variables);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Adjusted dataset" rows={rows} columns={columns} />
      </div>
    );
  }, [observations, adjustedDataset, types, variables]);

  const CovarianceTable = useMemo(() => {
    const columns = generateColumns(factors);
    const rows = generateRows(covariance, factors);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Covariance matrix" rows={rows} columns={columns} />
      </div>
    );
  }, [covariance, factors]);

  const AnalysisTable = useMemo(() => {
    const columnNames = [
      "Component",
      "Eigenvalue",
      "Difference b/n eigenvalues",
      "Proportion, %",
      "Cumulative, %"
    ];

    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [components, eigens.lambda.x, differences, proportion, cumulative],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <DXTable title="Analysis" rows={rows} columns={columns} />
        <div className={classes.analysisInfo}>
          <Typography variant="body1" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{factors.length}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            All <strong>{factors.length}</strong> components explain{" "}
            <strong>{round(totalProportion)}%</strong> variation of the data
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            <strong>{importantComponents.length}</strong> component
            {importantComponents.length > 1 ? "s" : ""} have eigenvalue
            {importantComponents.length > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>{round(importantComponentsVariance)}%</strong> of variation.
          </Typography>
        </div>
      </div>
    );
  }, [
    eigens.lambda.x,
    differences,
    proportion,
    totalProportion,
    cumulative,
    importantComponentsVariance
  ]);

  const LoadingsTable = useMemo(() => {
    const columnNames = ["Loadings", ...components];
    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [factors, ...unzip<number>(eigens.E.x)],
      columnNames
    );

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = ["Loadings", ...importantComponentNames];

    return (
      <div className={classes.tableBox}>
        <DXTable
          title="Loadings (i.e., Q matrix)"
          importantComponentsList={importantComponentsList}
          rows={rows}
          columns={columns}
          intervalFilter={true}
        />
      </div>
    );
  }, [eigens.E.x, factors, importantComponents]);

  const LinearCombinationsTable = useMemo(() => {
    const columnNames = [variables[observationsIdx], ...components];
    const columns = generateColumns(columnNames);
    const rows = generateRows(
      [observations, ...linearCombinations],
      columnNames
    );

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = [
      columnNames[0],
      ...importantComponentNames
    ];

    return (
      <div className={classes.tableBox}>
        <DXTable
          title="Linear Combinations"
          rows={rows}
          columns={columns}
          importantComponentsList={importantComponentsList}
        />
      </div>
    );
  }, [observations, variables, linearCombinations, importantComponents]);

  return (
    <div className={classes.root}>
      <div className={classes.tables}>
        {DatasetTable}
        {AdjustedDatasetTable}
        {CovarianceTable}
        {AnalysisTable}
        {LoadingsTable}
        {LinearCombinationsTable}
      </div>
    </div>
  );
};
