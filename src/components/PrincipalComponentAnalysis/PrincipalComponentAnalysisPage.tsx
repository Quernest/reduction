import * as React from "react";
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules
} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CalculateWorker from "worker-loader!./calculate.worker";
import UploadWorker from "worker-loader!./upload.worker";
import { Bar } from "./Bar";
import { Biplot } from "./Biplot";

interface IProps {
  classes?: any;
}

interface IState {
  selectedFile: File;
  dataset: object[];
  calculations: any; // TODO types
  visualize: boolean;
  calculating: boolean;
  calculated: boolean;
  uploading: boolean;
  uploaded: boolean;
  error: string;
}

const styles = ({ spacing, breakpoints }: Theme): StyleRules =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: spacing.unit * 2,
      [breakpoints.up("sm")]: {
        padding: spacing.unit * 3
      }
    },
    grid: {
      [breakpoints.up("md")]: {
        width: breakpoints.values.md
      }
    },
    button: {
      margin: spacing.unit
    },
    btnVisualize: {
      marginBottom: spacing.unit * 2
    },
    rightIcon: {
      marginLeft: spacing.unit
    },
    chip: {
      marginTop: spacing.unit,
      marginBottom: spacing.unit
    },
    tableBox: {
      marginTop: spacing.unit * 2,
      marginBottom: spacing.unit * 2
    },
    h5: {
      marginTop: spacing.unit * 2
    }
  });

export const PrincipalComponentAnalysisPage = withStyles(styles)(
  class extends React.Component<IProps, IState> {
    /**
     * upload web worker for uploading files in a separate thread
     */
    private uploadWorker: Worker;

    /**
     * calculate web worker for calculating principal component analysis algorithm in a separate thread
     */
    private calculateWorker: Worker;

    /**
     * reference (access) to the DOM file input node
     */
    private fileInput: React.RefObject<HTMLInputElement> = React.createRef();

    private initializeWebWorkers(): void {
      this.uploadWorker = new UploadWorker();
      this.calculateWorker = new CalculateWorker();
    }

    public componentDidMount() {
      this.initializeWebWorkers();
    }

    public render() {
      const { classes } = this.props;

      return (
        <div className={classes.root}>
          <Grid container={true} justify="center">
            <Grid container={true} className={classes.grid} alignItems="center">
              <Typography variant="h6" paragraph={true}>
                Principal Component Analysis
              </Typography>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                paragraph={true}
              >
                Principal component analysis (PCA) is a statistical procedure
                that uses an orthogonal transformation to convert a set of
                observations of possibly correlated variables (entities each of
                which takes on various numerical values) into a set of values of
                linearly uncorrelated variables called principal components.
              </Typography>
            </Grid>
          </Grid>
        </div>
      );
    }
  }
);

// // @flow
// import React from "react";
// import type { Node } from "react";
// import { withStyles } from "@material-ui/core/styles";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import Chip from "@material-ui/core/Chip";
// import Grid from "@material-ui/core/Grid";
// import CloudUploadIcon from "@material-ui/icons/CloudUpload";
// import map from "lodash/map";
// import * as math from "mathjs";
// import Table from "./Table";
// import CalculateWorker from "./calculate.worker";
// import UploadWorker from "./upload.worker";
// import Bar from "./Bar";
// import Biplot from "./Biplot";

// // types
// import type {
//   Dataset,
//   Points,
//   AdjustedDataset,
//   Covariance,
//   Eigens,
//   LinearCombinations,
//   Names,
//   Analysis
// } from "../../types/PCA";

// type Props = {
//   classes: Object
// };

// type State = {
//   selectedFile: File,
//   dataset: Dataset,
//   calculations: {
//     points: Points,
//     adjustedDataset: AdjustedDataset,
//     covariance: Covariance,
//     eigens: Eigens,
//     linearCombinations: LinearCombinations,
//     analysis: Analysis,
//     names: Names
//   },
//   visualize: boolean,
//   calculating: boolean,
//   calculated: boolean,
//   uploading: boolean,
//   uploaded: boolean,
//   error: string
// };

// class Page extends React.Component<Props, State> {
//   state = {
//     selectedFile: null,
//     dataset: [],
//     calculations: {
//       points: [],
//       adjustedDataset: [],
//       covariance: [],
//       eigens: {
//         E: {
//           x: [],
//           y: []
//         },
//         lambda: {
//           x: [],
//           y: []
//         }
//       },
//       linearCombinations: [],
//       names: [],
//       analysis: []
//     },
//     visualize: false,
//     calculating: false,
//     calculated: false,
//     uploading: false,
//     uploaded: false,
//     error: ""
//   };

//   uploadWorker = {};

//   calculateWorker = {};

//   fileInput: ?HTMLInputElement = React.createRef();

//   componentDidMount() {
//     this.initializeWebWorkers();
//   }

//   initializeWebWorkers() {
//     this.calculateWorker = new CalculateWorker();
//     this.uploadWorker = new UploadWorker();
//   }

//   onCalculate = (e: Event): void => {
//     const { dataset }: Dataset = this.state;

//     this.setState({
//       calculating: true,
//       calculated: false
//     });

//     // communication with worker
//     this.calculateWorker.addEventListener(
//       "message",
//       ev => {
//         const { data } = ev;

//         this.setState({
//           calculating: false,
//           calculated: true,
//           calculations: data
//         });
//       },
//       false
//     );

//     // error handler
//     this.calculateWorker.addEventListener("error", (event: ErrorEvent) => {
//       this.setState({
//         uploaded: false,
//         uploading: false,
//         error: event.message
//       });
//     });

//     // TODO: add timeout function (stop calculations if too long)
//     // send the dataset to the worker
//     this.calculateWorker.postMessage(dataset);
//   };

//   onFileSelectInputChange = (e: Event): void => {
//     const { files }: FileList = event.target;
//     const [file]: File = files;

//     // get type of file
//     const currentFileExtension: string = file.name.substring(
//       file.name.lastIndexOf(".")
//     );

//     // list of accepted file extensions
//     const acceptedExtensions: Array<string> = [".txt", ".csv"];

//     // return the error if it's not accepted extension
//     if (acceptedExtensions.indexOf(currentFileExtension) < 0) {
//       this.setState({
//         error: `Invalid file selected, valid files are of ${acceptedExtensions.toString()} types.`
//       });

//       return;
//     }

//     // reset input
//     // to be able to upload the same file again if it was canceled
//     event.target.value = ""; // eslint-disable-line

//     this.setState(
//       {
//         selectedFile: file
//       },
//       this.clearErrorBox
//     );
//   };

//   onFileUpload = (e: Event): void => {
//     this.setState(
//       {
//         uploaded: false,
//         uploading: true
//       },
//       this.clearErrorBox
//     );

//     const { selectedFile } = this.state;

//     // communication with worker
//     this.uploadWorker.addEventListener(
//       "message",
//       (event: MessageEvent) => {
//         this.setState({
//           uploaded: true,
//           uploading: false,
//           dataset: event.data
//         });
//       },
//       false
//     );

//     // error handler
//     this.uploadWorker.addEventListener("error", (event: ErrorEvent) => {
//       this.setState({
//         uploaded: false,
//         uploading: false,
//         error: event.message
//       });
//     });

//     // send selected file to the worker
//     this.uploadWorker.postMessage(selectedFile);
//   };

//   onFileCancel = () => {
//     this.setState(
//       {
//         selectedFile: null,
//         uploaded: false
//       },
//       this.clearErrorBox
//     );
//   };

//   onVisualize = () => {
//     this.setState({
//       visualize: true
//     });
//   };

//   clearErrorBox() {
//     this.setState({ error: "" });
//   }

//   render(): Node {
//     const { classes } = this.props;
//     const {
//       uploading,
//       uploaded,
//       calculating,
//       calculated,
//       visualize,
//       selectedFile,
//       dataset,
//       calculations,
//       error
//     } = this.state;
//     const {
//       linearCombinations,
//       adjustedDataset,
//       covariance,
//       points,
//       eigens,
//       names,
//       analysis
//     } = calculations;

//     return (
//       <div className={classes.root}>
//         <Grid container justify="center">
//           <Grid container className={classes.grid} alignItems="center">
//             <Typography variant="h6" paragraph>
//               Principal Component Analysis
//             </Typography>
//             <Typography variant="subtitle1" color="textSecondary" paragraph>
//               Principal component analysis (PCA) is a statistical procedure that
//               uses an orthogonal transformation to convert a set of observations
//               of possibly correlated variables (entities each of which takes on
//               various numerical values) into a set of values of linearly
//               uncorrelated variables called principal components.
//             </Typography>
//             {(() => {
//               if (uploading || calculating) {
//                 return (
//                   <Grid container justify="center">
//                     <CircularProgress className={classes.progress} />
//                   </Grid>
//                 );
//               }

//               if (visualize) {
//                 return (
//                   <>
//                     <Biplot points={points} vectors={eigens.E.x} axes={names} />
//                     <Bar
//                       values={eigens.lambda.x}
//                       names={names}
//                       analysis={analysis}
//                     />
//                   </>
//                 );
//               }

//               if (calculated) {
//                 return (
//                   <React.Fragment>
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       onClick={this.onVisualize}
//                       className={classes.btnVisualize}
//                     >
//                       Visualize
//                     </Button>
//                     <Grid item xs={12}>
//                       <Typography variant="subtitle1">
//                         Count of observations: {dataset.length}
//                       </Typography>
//                       <Typography variant="subtitle1">
//                         Count of factors: {names.length}
//                       </Typography>
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5">Original dataset</Typography>
//                       <Table rows={dataset} columns={names} />
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5">Adjusted dataset</Typography>
//                       <Table rows={adjustedDataset} columns={names} />
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5">Covariation Matrix</Typography>
//                       <Table rows={covariance} columns={names} />
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5" className={classes.h5}>
//                         Eigenanalysis of the Covariation Matrix
//                       </Typography>
//                       <Table
//                         enumerateSymbol="Component"
//                         rows={[eigens.lambda.x, analysis]}
//                         columns={["Eigenvalue", "Proportion, %"]}
//                       />
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5" className={classes.h5}>
//                         Eigenvectors (component loadings)
//                       </Typography>
//                       <Table
//                         rows={math.transpose(eigens.E.x)}
//                         columns={map(
//                           names,
//                           (name, index) => `PC${index + 1} (${name})`
//                         )}
//                       />
//                     </Grid>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h5">Linear Combinations</Typography>
//                       <Table
//                         rows={linearCombinations}
//                         columns={map(
//                           names,
//                           (name, index) => `PC${index + 1} (${name})`
//                         )}
//                       />
//                     </Grid>
//                   </React.Fragment>
//                 );
//               }

//               if (uploaded) {
//                 return (
//                   <React.Fragment>
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       onClick={this.onCalculate}
//                     >
//                       Calculate
//                     </Button>
//                     <Grid className={classes.tableBox} item xs={12}>
//                       <Typography variant="h6">Your dataset</Typography>
//                       <Table rows={dataset} />
//                     </Grid>
//                   </React.Fragment>
//                 );
//               }

//               return (
//                 <Grid item xs={12}>
//                   <input
//                     ref={this.fileInput}
//                     onChange={this.onFileSelectInputChange}
//                     type="file"
//                     multiple={false}
//                     hidden
//                   />
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={() => this.fileInput.current.click()}
//                   >
//                     choose a file
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     className={classes.button}
//                     disabled={!selectedFile}
//                     onClick={this.onFileUpload}
//                   >
//                     Upload
//                     <CloudUploadIcon className={classes.rightIcon} />
//                   </Button>
//                   {selectedFile && (
//                     <Grid item xs={12}>
//                       <Chip
//                         label={selectedFile.name}
//                         onDelete={this.onFileCancel}
//                         className={classes.chip}
//                       />
//                     </Grid>
//                   )}
//                 </Grid>
//               );
//             })()}
//             {error && (
//               <Typography variant="body2" color="error">
//                 {error}
//               </Typography>
//             )}
//           </Grid>
//         </Grid>
//       </div>
//     );
//   }
// }

// const styles = ({ spacing: { unit }, breakpoints: { up, values } }) => ({
//   root: {
//     flexGrow: 1,
//     padding: unit * 2,
//     [up("sm")]: {
//       padding: unit * 3
//     }
//   },
//   grid: {
//     [up("md")]: {
//       width: values.md
//     }
//   },
//   button: {
//     margin: unit
//   },
//   btnVisualize: {
//     marginBottom: unit * 2
//   },
//   rightIcon: {
//     marginLeft: unit
//   },
//   chip: {
//     marginTop: unit,
//     marginBottom: unit
//   },
//   tableBox: {
//     marginTop: unit * 2,
//     marginBottom: unit * 2
//   },
//   h5: {
//     marginTop: unit * 2
//   }
// });

// export default withStyles(styles)(Page);
