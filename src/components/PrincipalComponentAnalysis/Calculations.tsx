import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import * as math from "mathjs";
import React, { useMemo } from "react";
import { OutputTable } from "src/components/Tables";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";

const useStyles = makeStyles(({ spacing }: Theme) => ({
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
      amountOfImportantComponents,
      differences,
      cumulative
    },
    linearCombinations
  } = calculations;
  const { tailedVariables, variables, observations, values } = parsedFile;

  const tables = useMemo(
    () => (
      <div className={classes.tables}>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="body1">
            Dataset
          </Typography>
          <OutputTable rows={[observations, ...values]} columns={variables} />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="body1">
            Adjusted dataset
          </Typography>
          <OutputTable
            rows={[observations, ...adjustedDataset]}
            columns={variables}
          />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="body1">
            Covariation matrix
          </Typography>
          <OutputTable rows={covariance} columns={tailedVariables} />
        </div>
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
            rows={[eigens.lambda.x, differences, proportion, cumulative]}
            columns={[
              "Eigenvalue",
              "Difference b/n eigenvalues",
              "Proportion of variance explained, %",
              "Cumulative proportion of variance explained, %"
            ]}
          />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="body1">
            Component loadings
          </Typography>
          <OutputTable
            rows={[
              tailedVariables,
              ...(math.transpose(eigens.E.x) as number[][])
            ]}
            columns={map(["Loadings", ...tailedVariables], (_, i) =>
              i === 0 ? "Loadings" : `PC${i}`
            )}
          />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="body1">
            Predicted principal components
          </Typography>
          <OutputTable
            rows={[observations, ...linearCombinations]}
            columns={map(variables, (variable, i) =>
              i === 0 ? variable : `PC${i}`
            )}
          />
        </div>
      </div>
    ),
    [calculations, parsedFile]
  );

  return <div className={classes.root}>{tables}</div>;
};
