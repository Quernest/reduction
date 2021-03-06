import Divider from "@material-ui/core/Divider";
// import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
// import round from "lodash/round";
import debounce from "lodash/debounce";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { withTranslation, WithTranslation } from 'react-i18next';
import compose from "recompose/compose";
import {
  DatasetControls,
  Table,
  ErrorMessage,
  generateColumns,
  generateRows,
  UploadControls,
  HexagonalGrid,
  SOMControls
} from "../components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IParsedFile,
  IHexagonalGridDimensions,
  ISOMOptions
} from "../models";
import SOMWorker from "worker-loader!../workers/som.worker";
import UploadWorker from "worker-loader!../workers/upload.worker";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(3)
      }
    },
    wrap: {
      width: "100%",
      maxWidth: theme.breakpoints.values.lg,
      marginLeft: "auto",
      marginRight: "auto"
    },
    progress: {
      flexGrow: 1
    },
    divider: {
      marginBottom: theme.spacing(3)
    },
    maps: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    errors: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  });

interface ISOMPageProps
  extends WithStyles<typeof styles>,
  RouteComponentProps, WithTranslation { }

interface ISOMPageState {
  file?: File;
  parsedFile: IParsedFile;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  dataset: IDataset;
  uploading: boolean;
  uploaded: boolean;
  calculating: boolean;
  calculated: boolean;
  dimensions: IHexagonalGridDimensions;
  options: ISOMOptions;
  neurons: Neuron[];
  topographicError: number;
  quantizationError: number;
  positions: Array<[number, number]>;
  umatrix: number[];
  currentFactorIdx: number;
  error?: string;
}

class SOMPageBase extends React.Component<ISOMPageProps, ISOMPageState> {
  protected somWorker: Worker;
  protected uploadWorker: Worker;

  public readonly state: ISOMPageState = {
    file: undefined,
    parsedFile: {
      rows: [],
      columns: []
    },
    dataset: {
      observations: [],
      variables: [],
      factors: [],
      values: [],
      types: []
    },
    datasetRequiredColumnsIdxs: {
      observationsIdx: 0,
      typesIdx: undefined
    },
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    dimensions: {
      columns: 32,
      rows: 16
    },
    options: {
      maxStep: 1000,
      minLearningCoef: 0.3,
      maxLearningCoef: 0.7,
      minNeighborhood: 0.5,
      maxNeighborhood: 1
    },
    neurons: [],
    positions: [],
    umatrix: [],
    topographicError: 0,
    quantizationError: 0,
    currentFactorIdx: 0,
    error: undefined
  };

  public componentDidMount() {
    this.initWorkers();
  }

  public componentWillUnmount() {
    this.destroyWorkers();
  }

  protected initWorkers() {
    this.uploadWorker = new UploadWorker();
    this.uploadWorker.addEventListener(
      "message",
      this.onUploadWorkerMsg,
      false
    );
    this.somWorker = new SOMWorker();
    this.somWorker.addEventListener("message", this.onSOMWorkerMsg, false);
  }

  protected destroyWorkers() {
    this.uploadWorker.terminate();
    this.uploadWorker.removeEventListener(
      "message",
      this.onUploadWorkerMsg,
      false
    );
    this.somWorker.terminate();
    this.somWorker.removeEventListener("message", this.onSOMWorkerMsg, false);
  }

  protected onControlsSubmit = (
    newDimensions: IHexagonalGridDimensions,
    newOptions: ISOMOptions
  ) => {
    const { parsedFile, datasetRequiredColumnsIdxs } = this.state;

    this.setState({ dimensions: newDimensions, options: newOptions });
    this.startCalculating(
      datasetRequiredColumnsIdxs,
      parsedFile,
      newDimensions,
      newOptions
    );
  };

  protected onSOMWorkerMsg = debounce(
    ({
      data: {
        positions,
        umatrix,
        neurons,
        topographicError,
        quantizationError,
        dataset,
        error
      }
    }: MessageEvent) => {
      if (error) {
        this.setState({
          error,
          calculated: false,
          calculating: false,
          uploaded: false,
          uploading: false
        });
      } else {
        this.clearErrors();
        this.setState({
          dataset,
          positions,
          umatrix,
          neurons,
          topographicError,
          quantizationError,
          calculating: false,
          calculated: true
        });
      }
    },
    700
  );

  protected onUploadWorkerMsg = debounce(
    ({ data: { error, parsedFile } }: MessageEvent) => {
      if (error) {
        this.setState({
          error,
          uploaded: false,
          uploading: false
        });
      } else {
        this.clearErrors();
        this.setState({
          parsedFile,
          uploaded: true,
          uploading: false
        });
      }
    },
    700
  );

  protected onChangeFile = (chosenFile?: File, error?: string): void => {
    if (error) {
      this.setState({
        error
      });
    } else {
      this.clearErrors();
      this.setState({
        file: chosenFile
      });
    }
  };

  protected onUploadFile = (): void => {
    const { file } = this.state;

    this.setState({ uploading: true });
    this.uploadWorker.postMessage(file);
  };

  protected onCancelFile = (): void => {
    this.clearErrors();
    this.setState({
      file: undefined
    });
  };

  private clearErrors = () => this.setState({ error: undefined });

  protected onChangeFactor = (factorIdx: number) => {
    this.setState({
      currentFactorIdx: factorIdx
    });
  };

  protected onChangeDatasetRequiredColumns = (
    newDatasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) => {
    this.setState({
      datasetRequiredColumnsIdxs: newDatasetRequiredColumnsIdxs
    });
  };

  public startCalculating(
    datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes,
    parsedFile: IParsedFile,
    dimensions: IHexagonalGridDimensions,
    options: ISOMOptions
  ) {
    this.setState({ calculated: false, calculating: true });
    this.somWorker.postMessage({
      datasetRequiredColumnsIdxs,
      parsedFile,
      dimensions,
      options
    });
  }

  public render() {
    const { classes, t } = this.props;
    const {
      uploaded,
      uploading,
      calculating,
      calculated,
      dimensions,
      options,
      neurons,
      umatrix,
      positions,
      dataset: { observations, types, factors },
      datasetRequiredColumnsIdxs,
      parsedFile,
      currentFactorIdx,
      error,
      file
    } = this.state;

    const previewColumns = generateColumns(parsedFile.columns);
    const previewRows = generateRows(parsedFile.rows, parsedFile.columns);

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h1" gutterBottom={true}>
            {t('pages.som.title')}
          </Typography>
          {uploaded && (
            <SOMControls
              options={options}
              dimensions={dimensions}
              onSubmit={this.onControlsSubmit}
              onChangeFactor={this.onChangeFactor}
              currentFactorIdx={currentFactorIdx}
              factors={factors}
              loading={calculating}
            />
          )}
          {uploaded && !calculated && !calculating && (
            <>
              <DatasetControls
                rows={parsedFile.rows}
                columns={parsedFile.columns}
                onChange={this.onChangeDatasetRequiredColumns}
                datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
              />
              <Table
                title={t('dataset')}
                rows={previewRows}
                columns={previewColumns}
              />
            </>
          )}
          {calculated && (
            <div className={classes.maps}>
              {/* <div className={classes.errors}>
                <Grid container={true} spacing={1}>
                  <Grid item={true} xs="auto">
                    <Typography variant="body2">
                      {t('topographicError')}:{" "}
                      <span>{round(topographicError, 6)};</span>
                    </Typography>
                  </Grid>
                  <Grid item={true} xs="auto">
                    <Typography variant="body2">
                      {t('quantizationError')}:{" "}
                      <span>{round(quantizationError, 6)};</span>
                    </Typography>
                  </Grid>
                </Grid>
              </div> */}
              <HexagonalGrid
                title={t('heatmap')}
                neurons={neurons}
                dimensions={dimensions}
                heatmap={true}
                currentFactorIdx={currentFactorIdx}
                positions={positions}
                observations={observations}
                factors={factors}
                types={types}
              />
              <HexagonalGrid
                title={t('umatrix')}
                neurons={neurons}
                dimensions={dimensions}
                umatrix={umatrix}
              />
            </div>
          )}
          {!uploaded && !calculated && (
            <>
              <Typography variant="body1" paragraph={true}>
                {t('pages.som.description')}
              </Typography>
              <Divider className={classes.divider} />
              <UploadControls
                file={file}
                onUpload={this.onUploadFile}
                onChange={this.onChangeFile}
                onCancel={this.onCancelFile}
                uploading={uploading}
              />
            </>
          )}
          {error && <ErrorMessage text={error} />}
        </div>
      </div>
    );
  }
}

export const SOMPage = compose<ISOMPageProps, any>(
  withRouter,
  withTranslation(),
  withStyles(styles)
)(SOMPageBase);
