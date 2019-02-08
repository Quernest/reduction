import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import * as math from "mathjs";
import * as React from "react";
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
    analysis,
    linearCombinations
  } = calculations;
  const { data, headers } = parsedFile;

  const tables = React.useMemo(
    () => (
      <div className={classes.tables}>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            dataset
          </Typography>
          <OutputTable rows={data} columns={headers} />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            adjusted dataset
          </Typography>
          <OutputTable rows={adjustedDataset} columns={headers} />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            covariation matrix
          </Typography>
          <OutputTable rows={covariance} columns={headers} />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            Eigenanalysis of the Covariation Matrix
          </Typography>
          <OutputTable
            enumerateSymbol="Component"
            rows={[
              eigens.lambda.x,
              analysis.differences,
              analysis.proportion,
              analysis.cumulative
            ]}
            columns={[
              "Eigenvalue",
              "Difference b/n eigenvalues",
              "Proportion of variance explained",
              "Cumulative proportion of variance explained"
            ]}
          />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            Eigenvectors (component loadings)
          </Typography>
          <OutputTable
            rows={[headers, ...(math.transpose(eigens.E.x) as number[][])]}
            columns={map(
              ["Loadings", ...headers],
              (_: string, i: number): string =>
                i === 0 ? "Loadings" : `PC${i}`
            )}
          />
        </div>
        <div className={classes.tableBox}>
          <Typography className={classes.tableTitle} variant="button">
            Linear Combinations
          </Typography>
          <OutputTable
            rows={linearCombinations}
            columns={map(
              headers,
              (n: string, i: number): string => `PC${i + 1} (${n})`
            )}
          />
        </div>
      </div>
    ),
    [calculations, parsedFile]
  );

  return <div className={classes.root}>{tables}</div>;
};
