import LinearProgress from "@material-ui/core/LinearProgress";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import has from "lodash/has";
import * as React from "react";
import { UploadControls } from "src/components/UploadControls";
import { IParsedCSV } from "src/utils/csv";
// import { IPCACalculations } from 'src/models/pca.model';
// import CalculateWorker from "worker-loader!src/components/PrincipalComponentAnalysis/calculate.worker";
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
  visuazlied?: boolean;
}

const initialState: IState = {
  uploading: false,
  uploaded: false,
  calculating: false,
  calculated: false,
  visuazlied: false
};

export const PrincipalComponentAnalysisPage = (): JSX.Element => {
  const classes = useStyles();

  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [state, setState] = React.useState<IState>(initialState);
  // @ts-ignore
  const [parsedCSV, setParsedCSV] = React.useState<IParsedCSV>({
    headers: [],
    data: []
  });

  let uploadWorker: Worker;

  function cleanErrors() {
    setError(undefined);
  }

  function initWorkers() {
    uploadWorker = new UploadWorker();

    uploadWorker.addEventListener("message", (event: MessageEvent) => {
      if (has(event.data, "error")) {
        setState({ ...state, uploaded: false, uploading: false });
        setError(event.data.error);
      } else {
        setState({ ...state, uploaded: true, uploading: false });
        setParsedCSV(event.data.parsedCSV);
        cleanErrors();
      }
    });
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

  const { uploading, uploaded, calculating } = state;

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h6" paragraph={true}>
          Principal Component Analysis
        </Typography>
        {(uploading || calculating) && (
          <div className={classes.progress}>
            <LinearProgress />
          </div>
        )}
        {!(uploaded || uploading) && (
          <UploadControls
            file={file}
            onUpload={onUploadFile}
            onChange={onChangeFile}
            onCancel={onCancelFile}
          />
        )}
        {uploaded && <div>uploaded controls component and datasets</div>}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </div>
    </div>
  );
};

// import Button from "@material-ui/core/Button";
// import Chip from "@material-ui/core/Chip";
// import Grid from "@material-ui/core/Grid";
// import LinearProgress from "@material-ui/core/LinearProgress";
// import {
//   createStyles,
//   StyleRules,
//   Theme,
//   withStyles
// } from "@material-ui/core/styles";
// import Typography from "@material-ui/core/Typography";
// import CloudUploadIcon from "@material-ui/icons/CloudUpload";
// // import { makeStyles } from "@material-ui/styles";
// import isEmpty from "lodash/isEmpty";
// import map from "lodash/map";
// import * as math from "mathjs";
// import * as React from "react";
// import {
//   Bar,
//   Biplot,
//   SelectComponent
// } from "src/components/PrincipalComponentAnalysis";
// import { Points, Vectors } from "src/models/chart.model";
// import { IPCACalculations } from "src/models/pca.model";
// import { IParsedCSV } from "src/utils/csv";
// import { getMatrixColumn } from "src/utils/numbers";
// import CalculateWorker from "worker-loader!src/components/PrincipalComponentAnalysis/calculate.worker";
// import UploadWorker from "worker-loader!src/components/PrincipalComponentAnalysis/upload.worker";
// import { OutputTable } from "../components/Tables";

// const styles = ({ spacing, breakpoints }: Theme): StyleRules =>
//   createStyles({
//     root: {
//       flexGrow: 1,
//       padding: spacing.unit * 2,
//       [breakpoints.up("sm")]: {
//         padding: spacing.unit * 3
//       }
//     },
//     wrap: {
//       width: "100%",
//       maxWidth: breakpoints.values.md,
//       marginLeft: "auto",
//       marginRight: "auto"
//     },
//     grid: {
//       [breakpoints.up("md")]: {
//         width: breakpoints.values.md
//       }
//     },
// button: {
//   margin: spacing.unit
// },
//     btnVisualize: {
//       // marginBottom: spacing.unit * 2
//     },
// rightIcon: {
//   marginLeft: spacing.unit
// },
// chip: {
//   marginTop: spacing.unit,
//   marginBottom: spacing.unit
// },
//     tableBox: {
//       marginTop: spacing.unit * 2,
//       marginBottom: spacing.unit * 2
//     },
//     h5: {
//       marginTop: spacing.unit * 2
//     },
//     progressWrapper: {
//       flexGrow: 1
//     }
//   });

// interface IProps {
//   classes?: any;
// }

// interface IState {
//   selectedFile: null | File;
//   parsedCSV: IParsedCSV;
//   calculations: IPCACalculations;
//   visualize: boolean;
//   calculating: boolean;
//   calculated: boolean;
//   uploading: boolean;
//   uploaded: boolean;
//   error?: string;
//   selectedComponentX: number;
//   selectedComponentY: number;
//   // for select component (dynamic property)
//   [x: number]: number;
// }

// export const PrincipalComponentAnalysisPage = withStyles(styles)(
//   class extends React.Component<IProps, IState> {
//     public readonly state = {
//       selectedFile: null,
//       parsedCSV: {
//         headers: [] as string[],
//         data: [] as number[][]
//       },
//       calculations: {
//         dataset: [],
//         adjustedDataset: [],
//         covariance: [],
//         eigens: {
//           E: {
//             x: [],
//             y: []
//           },
//           lambda: {
//             x: [],
//             y: []
//           }
//         },
//         linearCombinations: [],
//         analysis: []
//       },
//       visualize: false,
//       calculating: false,
//       calculated: false,
//       uploading: false,
//       uploaded: false,
//       error: "",
//       selectedComponentX: 0,
//       selectedComponentY: 1
//     };

//     /**
//      * delayed time after uploading or calculating before loader will be faded
//      */
//     private progressDelayTime: number = 1000;

//     /**
//      * upload web worker for uploading files in a separate thread
//      */
//     private uploadWorker: Worker;

//     /**
//      * calculate web worker for calculating principal component analysis algorithm in a separate thread
//      */
//     private calculateWorker: Worker;

//     /**
//      * reference (access) to the DOM file input node
//      */
//     private fileInput: React.RefObject<HTMLInputElement> = React.createRef();

//     public componentDidMount() {
//       this.initializeWebWorkers();
//     }

//     private onCalculate = (): void => {
//       const { parsedCSV } = this.state;

//       this.setState({
//         calculating: true,
//         calculated: false
//       });

//       // communication with worker
//       this.calculateWorker.addEventListener(
//         "message",
//         (event: MessageEvent) => {
//           const { data } = event;

//           setTimeout(() => {
//             this.setState({
//               calculating: false,
//               calculated: true,
//               calculations: data
//             });
//           }, this.progressDelayTime);
//         },
//         false
//       );

//       // error handler
//       this.calculateWorker.addEventListener("error", (event: ErrorEvent) => {
//         setTimeout(() => {
//           this.setState({
//             uploaded: false,
//             uploading: false,
//             error: event.message
//           });
//         }, this.progressDelayTime);
//       });

//       // TODO: add timeout function (stop calculations if too long)
//       // send the parsedCSV to the worker
//       this.calculateWorker.postMessage(parsedCSV);
//     };

//     private onFileSelectInputChange = (
//       event: React.ChangeEvent<HTMLInputElement>
//     ): void => {
//       /**
//        * type conflict with null value in the state, how to fix it?
//        * the value null must be there if the file is not loaded
//        * but it conflicts with the File interface
//        */
//       // @ts-ignore: Unreachable code error
//       const files: FileList = event.target.files;

//       if (!isEmpty(files)) {
//         // @ts-ignore: Unreachable code error (same problem with null)
//         const file: File = files.item(0);

//         // get type of file
//         const currentFileExtension: string = file.name.substring(
//           file.name.lastIndexOf(".")
//         );

//         // list of accepted file extensions
//         const acceptedExtensions: string[] = [".txt", ".csv"];

//         // return the error if it's not accepted extension
//         if (acceptedExtensions.indexOf(currentFileExtension) < 0) {
//           this.setState({
//             error: `Invalid file selected, valid files are of [${acceptedExtensions.toString()}] types.`
//           });

//           return;
//         }

//         // reset input
//         // to be able to upload the same file again if it was canceled
//         event.target.value = "";

//         this.setState(
//           {
//             selectedFile: file
//           },
//           this.clearErrorBox
//         );
//       } else {
//         this.setState({
//           error: "input is empty"
//         });
//       }
//     };

//     private onFileUpload = (): void => {
//       this.setState(
//         {
//           uploaded: false,
//           uploading: true
//         },
//         this.clearErrorBox
//       );

//       const { selectedFile } = this.state;

//       // communication with worker
//       this.uploadWorker.addEventListener(
//         "message",
//         (event: MessageEvent) => {
//           setTimeout(() => {
//             this.setState({
//               uploaded: true,
//               uploading: false,
//               parsedCSV: event.data
//             });
//           }, this.progressDelayTime);
//         },
//         false
//       );

//       // error handler
//       this.uploadWorker.addEventListener("error", (event: ErrorEvent) => {
//         setTimeout(() => {
//           this.setState({
//             uploaded: false,
//             uploading: false,
//             error: event.message
//           });
//         }, this.progressDelayTime);
//       });

//       // send selected file to the worker
//       this.uploadWorker.postMessage(selectedFile);
//     };

//     private onChooseFileClick = (event: any): void => {
//       const input = this.fileInput.current;

//       if (input) {
//         input.click();
//       }
//     };

//     private onFileCancel = (): void => {
//       this.setState(
//         {
//           selectedFile: null,
//           uploaded: false
//         },
//         this.clearErrorBox
//       );
//     };

//     private onVisualize = (): void => {
//       this.setState({
//         visualize: true
//       });
//     };

//     private clearErrorBox = (): void => {
//       this.setState({ error: "" });
//     };

//     private initializeWebWorkers = (): void => {
//       this.uploadWorker = new UploadWorker();
//       this.calculateWorker = new CalculateWorker();
//     };

//     private onSelectComponentChange = (event: any): void => {
//       const { name, value } = event.target;

//       this.setState({
//         [name]: Number(value)
//       });
//     };

//     public render() {
//       const { classes } = this.props;
//       const {
//         uploading,
//         uploaded,
//         calculating,
//         calculated,
//         visualize,
//         selectedFile,
//         parsedCSV,
//         calculations,
//         error,
//         selectedComponentX,
//         selectedComponentY
//       } = this.state;
//       const {
//         linearCombinations,
//         adjustedDataset,
//         covariance,
//         eigens,
//         analysis
//       } = calculations;

//       return (
//         <div className={classes.root}>
//           <div className={classes.wrap}>
//             <Grid container={true} className={classes.grid}>
//               <Grid item={true} xs={12}>
//                 <Typography variant="h6" paragraph={true}>
//                   Principal Component Analysis
//                 </Typography>
//               </Grid>
//               {(() => {
//                 if (uploading || calculating) {
//                   return (
//                     <Grid item={true} xs={12}>
//                       <LinearProgress />
//                     </Grid>
//                   );
//                 }

//                 if (visualize) {
//                   // scatter points
//                   const points: Points = [
//                     adjustedDataset[selectedComponentX],
//                     adjustedDataset[selectedComponentY]
//                   ];

//                   // collection of x2 values
//                   const x2s: number[] = getMatrixColumn(
//                     eigens.E.x,
//                     selectedComponentX
//                   );

//                   // collection of y2 values
//                   const y2s: number[] = getMatrixColumn(
//                     eigens.E.x,
//                     selectedComponentY
//                   );

//                   // collection of x1 values
//                   const x1s: number[] = Array(x2s.length).fill(0);

//                   // collection of y1 values
//                   const y1s: number[] = Array(y2s.length).fill(0);

//                   // vectors
//                   const eigenvectors: Vectors = [x1s, y1s, x2s, y2s];

//                   return (
//                     <>
//                       <Grid container={true} alignItems="center">
//                         <SelectComponent
//                           analysis={analysis}
//                           onChange={this.onSelectComponentChange}
//                           selectedComponentX={selectedComponentX}
//                           selectedComponentY={selectedComponentY}
//                         />
//                       </Grid>
//                       <Biplot
//                         title="Biplot of score variables"
//                         eigenvectors={eigenvectors}
//                         names={parsedCSV.headers}
//                         xAxisLabel={`Component ${selectedComponentX + 1}`}
//                         yAxisLabel={`Component ${selectedComponentY + 1}`}
//                         points={points}
//                       />
//                       <Bar
//                         title="Scree plot of eigenvalues"
//                         eigenvalues={eigens.lambda.x}
//                         names={parsedCSV.headers}
//                         analysis={analysis}
//                       />
//                     </>
//                   );
//                 }

//                 if (calculated) {
//                   return (
//                     <React.Fragment>
//                       <Grid item={true} xs={12}>
//                         <Typography
//                           variant="body2"
//                           color="textSecondary"
//                           paragraph={true}
//                         >
//                           Calculations is ready. Press on the visualize button
//                           if you want represent the dataset.
//                         </Typography>
//                       </Grid>
//                       <Grid container={true} alignItems="center">
//                         <SelectComponent
//                           analysis={analysis}
//                           onChange={this.onSelectComponentChange}
//                           selectedComponentX={selectedComponentX}
//                           selectedComponentY={selectedComponentY}
//                         />
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={this.onVisualize}
//                           className={classes.btnVisualize}
//                         >
//                           Visualize
//                         </Button>
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title">
//                           Original dataset
//                         </Typography>
//                         <OutputTable
//                           rows={parsedCSV.data}
//                           columns={parsedCSV.headers}
//                         />
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title">
//                           Adjusted dataset
//                         </Typography>
//                         <OutputTable
//                           rows={adjustedDataset}
//                           columns={parsedCSV.headers}
//                         />
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title">
//                           Covariation Matrix
//                         </Typography>
//                         <OutputTable
//                           rows={covariance}
//                           columns={parsedCSV.headers}
//                         />
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title" className={classes.h5}>
//                           Eigenanalysis of the Covariation Matrix
//                         </Typography>
//                         <OutputTable
//                           enumerateSymbol="Component"
//                           rows={[eigens.lambda.x, analysis]}
//                           columns={["Eigenvalue", "Proportion, %"]}
//                         />
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title" className={classes.h5}>
//                           Eigenvectors (component loadings)
//                         </Typography>
//                         <OutputTable
//                           rows={[
//                             parsedCSV.headers,
//                             ...(math.transpose(eigens.E.x) as number[][])
//                           ]}
//                           columns={map(
//                             ["Loadings", ...parsedCSV.headers],
//                             (name: string, index: number): string => {
//                               if (index === 0) {
//                                 return "Loadings";
//                               }

//                               return `PC${index}`;
//                             }
//                           )}
//                         />
//                       </Grid>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="title">
//                           Linear Combinations
//                         </Typography>
//                         <OutputTable
//                           rows={linearCombinations}
//                           columns={map(
//                             parsedCSV.headers,
//                             (name: string, index: number): string =>
//                               `PC${index + 1} (${name})`
//                           )}
//                         />
//                       </Grid>
//                     </React.Fragment>
//                   );
//                 }

//                 if (uploaded) {
//                   return (
//                     <React.Fragment>
//                       <Grid item={true} xs={12}>
//                         <Typography
//                           variant="body2"
//                           color="textSecondary"
//                           paragraph={true}
//                         >
//                           The dataset is uploaded. Use calculate button for
//                           analysing.
//                         </Typography>
//                       </Grid>
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={this.onCalculate}
//                       >
//                         Calculate
//                       </Button>
//                       <Grid className={classes.tableBox} item={true} xs={12}>
//                         <Typography variant="h6">Your dataset</Typography>
//                         <OutputTable
//                           rows={parsedCSV.data}
//                           columns={parsedCSV.headers}
//                         />
//                       </Grid>
//                     </React.Fragment>
//                   );
//                 }

// return (
//   <React.Fragment>
//     <Grid item={true} xs={12}>
//       <Typography
//         variant="body2"
//         color="textSecondary"
//         paragraph={true}
//       >
//         How to use?
//       </Typography>
//     </Grid>
//     <Grid item={true} xs={12}>
//       <input
//         ref={this.fileInput}
//         onChange={this.onFileSelectInputChange}
//         type="file"
//         multiple={false}
//         hidden={true}
//       />
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={this.onChooseFileClick}
//       >
//         choose a file
//       </Button>
//       <Button
//         variant="contained"
//         color="primary"
//         className={classes.button}
//         disabled={!selectedFile}
//         onClick={this.onFileUpload}
//       >
//         Upload
//         <CloudUploadIcon className={classes.rightIcon} />
//       </Button>
//       {selectedFile && (
//         <Grid item={true} xs={12}>
//           <Chip
//             // @ts-ignore: Unreachable code error (same problem with null)
//             label={selectedFile.name}
//             onDelete={this.onFileCancel}
//             className={classes.chip}
//           />
//         </Grid>
//       )}
//     </Grid>
//   </React.Fragment>
// );
//               })()}
//               {error && (
//                 <Typography variant="body2" color="error">
//                   {error}
//                 </Typography>
//               )}
//             </Grid>
//           </div>
//         </div>
//       );
//     }
//   }
// );
