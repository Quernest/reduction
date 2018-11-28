// @flow
import React, { Component } from 'react';
import {
  Grid, Button, Typography, withStyles, LinearProgress, Tooltip,
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import styles from './styles';
import { Chart } from '.';
import PCA from './PCA';

/**
 * TODO:
 * 1) better optimized validation
 * 2) dynamic form for adding factors
 * 3) logic for plotting scatterplot
 * 4) promise-based algorithm
 * 5) pass vecotrs coordinates to Chart component
 * 6) comments
 */

type Props = {
  classes: Object,
};

type State = {
  dataset: Array<number[]>,
  plotting: boolean,
  plotted: boolean,
  calculating: boolean,
  calculated: boolean,
  uploading: boolean,
  uploaded: boolean,
};

class Main extends Component<Props, State> {
  state = {
    dataset: [],
    scatterPoints: [],
    plotting: false,
    plotted: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
  };

  onUpload = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length) {
      throw new Error('This file rejected');
    }

    if (!acceptedFiles || acceptedFiles.length === 0) {
      throw new Error('No files found!');
    }

    this.setState({
      uploading: true,
      uploaded: false,
    });

    const [file] = acceptedFiles;

    if (!file) {
      throw new Error('Uploading error');
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: this.onParseComplete,
    });
  };

  validate = (results) => {
    if (!results || results.length === 0) {
      throw new Error('Results not found!');
    }

    if (results && !results.data) {
      throw new Error('Passed results have not data array');
    }

    const { data } = results;

    function hasNull(obj) {
      return Object.values(obj).some(x => x == null);
    }

    function isNotNumber(obj) {
      return Object.values(obj).some(x => typeof x !== 'number');
    }

    data.forEach((o, i) => {
      if (hasNull(o)) {
        console.log(`Error. ${i + 2} row has null value`);
      } else if (isNotNumber(o)) {
        console.log(`Error. ${i + 2} row has wrong type of value. Must be number.`);
      } else {
        return o;
      }
    });

    const dataset = data;

    this.setState({
      dataset,
    });
  };

  calculate = (): void => {
    const { dataset } = this.state;

    console.time('PCA performance');
    console.log('==========================================');

    this.setState({
      calculating: true,
      calculated: false,
    });

    const pca = new PCA(dataset);

    console.log('normalized dataset', pca.normalizedDataset);
    console.log('covariance', pca.covariance);
    console.log('points', pca.points);
    console.log('eigens', pca.eigens);

    this.setState({
      calculating: false,
      calculated: true,
      scatterPoints: pca.points,
    });

    console.log('==========================================');
    console.timeEnd('PCA performance');
  };

  plot = (): void => {
    console.log('==========================================');
    console.log('plotting ...');

    this.setState({
      plotting: true,
      plotted: false,
    });

    setTimeout(() => this.setState({ plotted: true, plotting: false }), 1000);

    console.log('==========================================');
  };

  download = (): void => null;

  onParseComplete = (results) => {
    this.validate(results);

    this.setState({
      uploading: false,
      uploaded: true,
    });
  };

  onFileDialogCancel = (e) => {};

  checkFileTypes = ({
    isDragAccept, isDragReject, acceptedFiles, rejectedFiles,
  }): string => {
    if (acceptedFiles.length) {
      return `Accepted ${acceptedFiles.length} files`;
    }

    if (rejectedFiles.length) {
      return `Rejected ${rejectedFiles.length} files`;
    }

    if (isDragAccept) {
      return 'This file is authorized';
    }

    if (isDragReject) {
      return 'This file is not authorized';
    }

    return 'Drop .txt or .csv file here';
  };

  render() {
    const { classes } = this.props;
    const {
      uploading, uploaded, calculating, calculated, plotting, plotted, scatterPoints,
    } = this.state;

    const isVisibleProgressBar: boolean = uploading || calculating || plotting;
    const isVisibleCalculateButton: boolean = uploaded && !calculated;

    return (
      <div className={classes.root}>
        <Grid className={classes.grid} container>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              Principal component analysis
            </Typography>
            <Typography variant="subtitle1">
              Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
              transformation to convert a set of observations of possibly correlated variables
              (entities each of which takes on various numerical values) into a set of values of
              linearly uncorrelated variables called principal components.
            </Typography>
            <div className={classes.dropZoneWrap}>
              <Dropzone
                className={classes.dropZone}
                activeClassName={classes.activeDropZone}
                rejectClassName={classes.rejectedDropZone}
                multiple={false}
                accept="text/x-csv, text/plain, application/vnd.ms-excel"
                onDrop={this.onUpload}
                onFileDialogCancel={this.onFileDialogCancel}
              >
                {props => this.checkFileTypes(props)}
              </Dropzone>
              {isVisibleCalculateButton && (
                <Button
                  className={classes.btnCalculate}
                  color="primary"
                  variant="contained"
                  onClick={this.calculate}
                  disabled={calculating}
                >
                  Calculate
                </Button>
              )}
              {calculated && (
                <Button
                  className={classes.btnCalculate}
                  color="primary"
                  variant="contained"
                  onClick={this.plot}
                  disabled={plotting || plotted}
                >
                  Plot
                </Button>
              )}
              {calculated && (
                <Tooltip title="Download results in Microsoft Word .docx format">
                  <Button
                    className={classes.btnDownload}
                    color="primary"
                    variant="contained"
                    onClick={this.download}
                  >
                    Word
                  </Button>
                </Tooltip>
              )}
              {plotted && <Chart points={scatterPoints} />}
            </div>
            {isVisibleProgressBar && <LinearProgress className={classes.linearProgress} />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);

// // @flow
// // Principal component analysis page
// import React, { Component } from 'react';
// import {
//   Grid, Button, Typography, withStyles, LinearProgress, Tooltip,
// } from '@material-ui/core';

// // Math.js is an extensive math library for JavaScript and Node.js.
// import * as math from 'mathjs';

// // lib computes the covariance between one or more numeric arrays.
// import cov from 'compute-covariance';

// // library for formatting and manipulating numbers.
// import numeric from 'numeric';

// // drag'n'drop zone for files
// import Dropzone from 'react-dropzone';

// // utilities
// import { transformDatasetToPoints } from '../../helpers/utils';
// import { Chart } from '.';

// try {
//   // import the numeric.js library into math.js
//   math.import(numeric, { wrap: true, silent: true });
// } catch (error) {
//   console.warn(
//     'Warning: To use numeric.js, the library must be installed first via "npm install numeric"',
//   );
// }

// type Props = {
//   classes: Object,
// };

// type State = {
//   dataset: Array<number[]>,
//   normalizedDataset: Array<number[]>,
//   covariance: Array<number[]>,
//   eigens: {
//     // eigenvectors
//     lambda: {
//       x: Array<number[]>,
//       y: Array<number[]>,
//     },
//     // eigenvalues
//     E: {
//       x: Array<number>,
//       y: Array<number>,
//     },
//   },
//   linearCombinations: any, // TODO: create type
//   analyzes: any, // TODO: create type
//   normalizedDatasetPoints: Array<{ x: number, y: number }>,
//   calculating: boolean,
//   calculated: boolean,
//   plotting: boolean,
//   plotted: boolean,
//   ready: boolean,
// };

// class PCA extends Component<Props, State> {
//   state = {
//     // FIXME: It's a fake dataset
//     dataset: [[8, 18, 16, 20], [1.79, 4.0, 6.11, 8.42]],
//     normalizedDataset: [],
//     normalizedDatasetPoints: [],
//     covariance: [],
//     eigens: {},
//     linearCombinations: undefined,
//     analyzes: undefined,
//     uploading: false,
//     uploaded: false,
//     calculating: false,
//     calculated: false,
//     plotting: false,
//     plotted: false,
//   };

//   calculate = (): void => {
//     const { dataset } = this.state;

//     this.setState({
//       calculating: true,
//       calculated: false,
//     });

//     // 1) normalize the dataset and get points
//     const normalizedDataset: Array<number[]> = this.normalize(dataset);
//     const normalizedDatasetPoints: Array<{ x: number, y: number }> = transformDatasetToPoints(
//       normalizedDataset,
//     );

//     // 2) compute matrix covariance
//     const covariance: Array<number[]> = cov(normalizedDataset);

//     // 3-4) compute eigenvalues and eigenvectors
//     const eigens: {
//       lambda: {
//         x: Array<number[]>,
//         y: Array<number[]>,
//       },
//       E: {
//         x: Array<number>,
//         y: Array<number>,
//       },
//     } = this.eig(covariance);

//     // 5) compute Linear Combinations
//     const linearCombinations = undefined;

//     // 6) analyse (calc percentage, etc...)
//     // const analyzes = this.analyse(eigens);

//     this.setState(
//       {
//         normalizedDataset,
//         covariance,
//         linearCombinations,
//         eigens,
//         // analyzes,
//         normalizedDatasetPoints,
//         calculating: false,
//         calculated: true,
//       },
//       () => console.log(this.state),
//     );
//   };

//   normalize = (dataset: Array<number[]>): Array<number[]> => dataset.map((data: Array<number>) => {
//     const mean: number = math.mean(data);
//     const variance: number = math.var(data);

//     return data.map((value: number) => (value - mean) / math.sqrt(variance));
//   });

//   eig = (
//     covariance: Array<number[]>,
//   ): {
//     lambda: {
//       x: Array<number[]>,
//       y: Array<number[]>,
//     },
//     E: {
//       x: Array<number>,
//       y: Array<number>,
//     },
//   } => {
//     const matrix = math.matrix(covariance);

//     if (!math.eig) {
//       throw new Error('eigenvectors and eigenvalues is not supported in current version!');
//     }

//     return math.eval(`eig(${matrix})`);
//   };

//   // analyse = (eigens: {
//   //   lambda: {
//   //     x: Array<number[]>,
//   //     y: Array<number[]>,
//   //   },
//   //   E: {
//   //     x: Array<number>,
//   //     y: Array<number>,
//   //   },
//   // }) => undefined;

//   onUpload = (files) => {
//     if (files && files.length === 0) {
//       throw new Error('No files found!');
//     }

//     const reader = new FileReader();
//     const [file] = files;

//     reader.onload = () => {
//       const csv = reader.result;

//       const parseCSV = (csv) => {
//         const lines = csv.split('\n');
//         const result = [];
//         const headers = lines[0].split(',');

//         lines.map((line, indexLine) => {
//           if (indexLine < 1) return;

//           const obj = {};
//           const currentLine = line.split(',');

//           headers.map((header, indexHeader) => {
//             obj[header] = currentLine[indexHeader];
//           });

//           result.push(obj);
//         });

//         result.pop();

//         return result;
//       };

//       const parsedFile = parseCSV(csv);

//       console.log(parsedFile);

//       // if (parsedFile && parsedFile.length > 0) {
//       //   parsedFile.forEach((o) => {
//       //     Object.values(o).forEach(val => {
//       //       if (typeof val === 'undefined') {
//       //         console.log(true);
//       //       }
//       //     });
//       //   });
//       // }
//     };

//     reader.readAsBinaryString(file);
//   };

//   onCancel = () => null;

//   plot = () => {
//     this.setState({
//       plotted: true,
//     });
//   };

//   render() {
//     const { classes } = this.props;
//     const {
//       calculated, calculating, plotted, plotting, normalizedDatasetPoints,
//     } = this.state;

//     return (
//       <div className={classes.wrap}>
//         <Grid className={classes.grid} container>
//           <Grid item>
//             <Typography className={classes.title} variant="h5">
//               Principal component analysis
//             </Typography>
//             <Typography variant="subtitle1">
//               Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
//               transformation to convert a set of observations of possibly correlated variables
//               (entities each of which takes on various numerical values) into a set of values of
//               linearly uncorrelated variables called principal components.
//             </Typography>
//             {/* {calculated ? (
//               <div>
//                 <Button
//                   className={classes.btnPlot}
//                   color="primary"
//                   variant="contained"
//                   onClick={this.plot}
//                   disabled={plotted || plotting}
//                 >
//                   Plot
//                 </Button>
//                 <Tooltip title="Download results in Microsoft Word .docx format">
//                   <Button
//                     className={classes.btnDownload}
//                     color="primary"
//                     variant="contained"
//                     onClick={this.download}
//                   >
//                     Word
//                   </Button>
//                 </Tooltip>
//               </div>
//             ) : (
//               <Button
//                 className={classes.btnCalculate}
//                 color="primary"
//                 variant="contained"
//                 onClick={this.calculate}
//                 disabled={calculating}
//               >
//                 Calculate
//               </Button>
//             )} */}

//             <Dropzone
//               multiple={false}
//               accept=".csv"
//               onDrop={this.onUpload}
//               onFileDialogCancel={this.onCancel}
//               // className={classes.dropZone}
//             >
//               <p className={classes.dropZoneText}>
//                 Try dropping .csv file here, or click to select the file to upload.
//               </p>
//             </Dropzone>

//             {(calculating || plotting) && <LinearProgress className={classes.linearProgress} />}
//             {plotted && <Chart points={normalizedDatasetPoints} />}
//           </Grid>
//         </Grid>
//       </div>
//     );
//   }
// }

// const styles = theme => ({
//   wrap: {
//     padding: 20,
//   },
//   title: {
//     marginBottom: 16,
//   },
//   grid: {
//     [theme.breakpoints.up('lg')]: {
//       width: 1170,
//       marginLeft: 'auto',
//       marginRight: 'auto',
//     },
//   },
//   dropZone: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   dropZoneText: {
//     margin: 0,
//     padding: 16,
//   },
//   linearProgress: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   btnCalculate: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   btnPlot: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   btnDownload: {
//     marginLeft: 16,
//   },
// });

// export default withStyles(styles)(PCA);
