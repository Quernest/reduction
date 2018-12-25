// @flow
import React, { Component } from 'react';
import { withStyles, Grid, Typography } from '@material-ui/core';
import { Document, Packer, Paragraph } from 'docx';
import { round } from 'lodash';
import saveAs from 'file-saver';
import { Biplot, Bar } from './Charts';
import { Header } from '.';
import { UploadWorker, CalculateWorker } from './WebWorkers'; // eslint-disable-line
import { Controls, UploadControls, AlgorithmControls } from './Controls';
import ProgressBar from '../ProgressBar';
import styles from './styles';

type Props = {
  classes: Object,
};

type State = {
  selectedFile: File,
  dataset: Array<number[]>,
  calculations: {
    scatterPoints: Array<{
      x: number,
      y: number,
    }>,
    adjustedDataset: Array<number[]>,
    covariance: Array<number[]>,
    eigens: {
      lambda: {
        x: Array<number[]>,
        y: Array<number[]>,
      },
      E: {
        x: Array<number>,
        y: Array<number>,
      },
    },
    linearCombinations: Array<number[]>,
    names: Array<string>,
  },
  plotting: boolean,
  plotted: boolean,
  calculating: boolean,
  calculated: boolean,
  uploading: boolean,
  uploaded: boolean,
  error: string,
};

class Main extends Component<Props, State> {
  state = {
    selectedFile: null,
    dataset: [],
    calculations: {
      scatterPoints: [],
      adjustedDataset: [],
      covariance: [],
      eigens: {},
      linearCombinations: [],
    },
    plotting: false,
    plotted: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
    error: '',
  };

  componentDidMount() {
    // initialzie workers
    this.uploadWorker = new UploadWorker();
    this.calculateWorker = new CalculateWorker();
  }

  onCalculate = (): void => {
    const { dataset }: Array<number[]> = this.state;

    this.setState({
      calculating: true,
      calculated: false,
    });

    // communication with worker
    this.calculateWorker.addEventListener(
      'message',
      (ev) => {
        const { data } = ev;

        this.setState({
          calculating: false,
          calculated: true,
          calculations: data,
        });
      },
      false,
    );

    // error handler
    this.calculateWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

    // TODO: add timeout function (stop calculations if too long)
    // send the dataset to the worker
    this.calculateWorker.postMessage(dataset);
  };

  onChartPlot = (): void => {
    this.setState({
      plotting: false,
      plotted: true,
    });
  };

  onDocumentDownload = async (): void => {
    const { calculations } = this.state;
    const { eigenvalues, analysis, scatterPoints } = calculations;

    const doc = new Document({
      creator: 'Clippy',
      title: 'Sample Document',
      description: 'A brief example of using docx',
    });

    doc.Styles.createParagraphStyle('Heading1', 'Heading 1')
      .basedOn('Normal')
      .next('Normal')
      .quickFormat()
      .size(36)
      .bold()
      .center();

    doc.createParagraph('Principal Component Analysis').heading1();

    // create table
    const table = doc.createTable(3, 3);

    table.getCell(0, 0).addContent(new Paragraph('Component'));
    table.getCell(0, 1).addContent(new Paragraph('Eigenvalue'));
    table.getCell(0, 2).addContent(new Paragraph('Account, %'));

    Object.keys(scatterPoints[0]).map(
      (key: string, i: number) => table.getCell(i + 1, 0).addContent(new Paragraph(key)), // display original key name instead "x" and "y"
    );

    eigenvalues.map(
      (value: number, i: number): void => table.getCell(i + 1, 1).addContent(new Paragraph(round(value, 4))),
    );

    analysis.map((value: number, i: number) => table.getCell(i + 1, 2).addContent(new Paragraph(round(value, 2))));

    // pack to blob and save via file-saver
    const packer = new Packer();

    try {
      const blob = await packer.toBlob(doc);

      saveAs(blob, 'pca.docx');
    } catch (error) {
      this.setState({
        error,
      });

      throw new Error(error); // handle it
    }
  };

  onFileSelectInputChange = (event: Event) => {
    const { files }: FileList = event.target;
    const [file]: File = files;

    // reset input
    // to be able to upload the same file again if it was canceled
    event.target.value = ''; // eslint-disable-line

    this.setState({
      selectedFile: file,
    });
  };

  onFileUpload = () => {
    this.setState({
      error: '',
      uploaded: false,
      uploading: true,
    });

    const { selectedFile } = this.state;

    // communication with worker
    this.uploadWorker.addEventListener(
      'message',
      (event: MessageEvent) => {
        this.setState({
          uploaded: true,
          uploading: false,
          dataset: event.data,
        });
      },
      false,
    );

    // error handler
    this.uploadWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

    // send selected file to the worker
    this.uploadWorker.postMessage(selectedFile);
  };

  onFileCancel = () => {
    this.setState({
      selectedFile: null,
      uploaded: false,
      error: '',
    });
  };

  render() {
    const { classes } = this.props;
    const {
      uploading,
      uploaded,
      calculating,
      calculated,
      plotting,
      plotted,
      selectedFile,
      calculations,
      error,
    } = this.state;

    const {
      scatterPoints, eigens, names, analysis,
    } = calculations;

    return (
      <div className={classes.root}>
        <Grid className={classes.grid} container>
          <Grid item>
            <Header />
            <Controls>
              <UploadControls
                onFileUpload={this.onFileUpload}
                onFileSelectInputChange={this.onFileSelectInputChange}
                onFileCancel={this.onFileCancel}
                multiple={false}
                file={selectedFile}
                uploading={uploading}
                uploaded={uploaded}
              />
              <AlgorithmControls
                onCalculate={this.onCalculate}
                onChartPlot={this.onChartPlot}
                onDocumentDownload={this.onDocumentDownload}
                uploaded={uploaded}
                calculated={calculated}
                calculating={calculating}
                plotting={plotting}
                plotted={plotted}
              />
            </Controls>
            <ProgressBar active={uploading || calculating} />
            {plotted && (
              <div className={classes.charts}>
                <Biplot
                  points={scatterPoints}
                  vectors={eigens.E.x}
                  names={names}
                  analysis={analysis}
                />
                <Bar
                  values={eigens.lambda.x}
                  names={names}
                  analysis={analysis}
                />
              </div>
            )}
            {/* errors should be as list */}
            {
              <Typography variant="body1" color="error">
                {error.toString()}
              </Typography>
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);
