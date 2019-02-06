import LinearProgress from "@material-ui/core/LinearProgress";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import debounce from "lodash/debounce";
import has from "lodash/has";
import * as React from "react";
import {
  CalculateControls,
  Calculations,
  Charts,
  ErrorBox,
  UploadControls,
  VisualizeControls
} from "src/components";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";
import CalculateWorker from "worker-loader!src/components/PrincipalComponentAnalysis/calculate.worker";
import UploadWorker from "worker-loader!src/components/PrincipalComponentAnalysis/upload.worker";

const useStyles = makeStyles(({ spacing, breakpoints }: Theme) => ({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up("sm")]: {
      padding: spacing.unit * 3
    }
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.md,
    marginLeft: "auto",
    marginRight: "auto"
  },
  progress: {
    flexGrow: 1
  }
}));

interface IState {
  uploading?: boolean;
  uploaded?: boolean;
  calculating?: boolean;
  calculated?: boolean;
  visualized?: boolean;
}

const initialState: IState = {
  uploading: false,
  uploaded: false,
  calculating: false,
  calculated: false,
  visualized: false
};

export const PrincipalComponentAnalysisPage = (): JSX.Element => {
  const classes = useStyles();

  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [state, setState] = React.useState<IState>(initialState);
  const [parsedFile, setParsedFile] = React.useState<IParsedCSV>({
    headers: [],
    data: []
  });
  const [calculations, setCalculations] = React.useState<IPCACalculations>({
    dataset: [],
    adjustedDataset: [],
    covariance: [],
    eigens: {
      E: {
        y: [],
        x: []
      },
      lambda: {
        x: [],
        y: []
      }
    },
    linearCombinations: [],
    analysis: []
  });

  /**
   * selected components.
   * contains selected x and y axes of principal components
   */
  const [components, setComponents] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 1
  });

  const debounceTime: number = 1000;

  let uploadWorker: Worker;
  let calculateWorker: Worker;

  function cleanErrors() {
    setError(undefined);
  }

  function initWorkers() {
    uploadWorker = new UploadWorker();
    calculateWorker = new CalculateWorker();

    uploadWorker.addEventListener(
      "message",
      debounce((event: MessageEvent) => {
        if (has(event.data, "error")) {
          setError(event.data.error);
          setState({ ...state, uploaded: false, uploading: false });
        } else {
          cleanErrors();
          setParsedFile(event.data.parsedFile);
          setState({ ...state, uploaded: true, uploading: false });
        }
      }, debounceTime)
    );

    calculateWorker.addEventListener(
      "message",
      debounce((event: MessageEvent) => {
        setCalculations(event.data);
        setState({ ...state, calculated: true, calculating: false });
      }, debounceTime)
    );
  }

  // init workers on component did mount
  React.useEffect(initWorkers);

  const onChangeFile = (chosenFile?: File, err?: string): void => {
    if (err) {
      setError(err);
    } else {
      cleanErrors();
      setFile(chosenFile);
    }
  };

  const onUploadFile = (): void => {
    setState({ ...state, uploading: true });
    uploadWorker.postMessage(file);
  };

  const onCancelFile = (): void => {
    cleanErrors();
    setFile(undefined);
  };

  const onCalculate = (): void => {
    setState({ ...state, calculating: true });
    calculateWorker.postMessage(parsedFile);
  };

  const onVisualize = (): void => {
    setState({ ...state, visualized: true });
  };

  const onChangeSelectComponents = (newComponents: {
    x: number;
    y: number;
  }): void => {
    setComponents({ ...components, ...newComponents });
  };

  const { analysis } = calculations;
  const { uploading, uploaded, calculated, calculating, visualized } = state;

  const isLoading = uploading || calculating;

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h6" paragraph={true}>
          Principal Component Analysis
        </Typography>
        {isLoading && (
          <div className={classes.progress}>
            <LinearProgress />
          </div>
        )}
        {!isLoading && !uploaded && (
          <UploadControls
            file={file}
            onUpload={onUploadFile}
            onChange={onChangeFile}
            onCancel={onCancelFile}
          />
        )}
        {!isLoading && !calculated && uploaded && (
          <CalculateControls
            parsedFile={parsedFile}
            onCalculate={onCalculate}
          />
        )}
        {!isLoading && calculated && !visualized && (
          <>
            <VisualizeControls
              analysis={analysis}
              onVisualize={onVisualize}
              onChangeSelectComponents={onChangeSelectComponents}
              components={components}
            />
            <Calculations parsedFile={parsedFile} calculations={calculations} />
          </>
        )}
        {!isLoading && visualized && (
          <Charts
            onChangeSelectComponents={onChangeSelectComponents}
            parsedFile={parsedFile}
            calculations={calculations}
            components={components}
          />
        )}
        <ErrorBox message={error} />
      </div>
    </div>
  );
};
