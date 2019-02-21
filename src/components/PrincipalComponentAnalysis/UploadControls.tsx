import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  rightIcon: {
    marginLeft: spacing.unit
  },
  chip: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit
  },
  buttonWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

interface IProps {
  file?: File;
  uploading?: boolean;
  onChange: (chosenFile?: File, error?: string) => void;
  onUpload: () => void;
  onCancel: () => void;
}

export const UploadControls = (props: IProps): JSX.Element => {
  const classes = useStyles();
  const { uploading } = props;
  const fileInput: React.RefObject<HTMLInputElement> = React.createRef();

  const onChoose = (event: any): void => {
    const input = fileInput.current;

    if (input) {
      input.click();
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files: FileList | null = event.target.files;

    if (files) {
      const chosenFile = files.item(0);

      if (chosenFile) {
        /**
         * list of accepted file extensions
         */
        const exts: string[] = [".txt", ".csv"];

        /**
         * chosen file extension
         */
        const ext: string = chosenFile.name.substring(
          chosenFile.name.lastIndexOf(".")
        );

        // return the error if it's not accepted extension
        if (exts.indexOf(ext) < 0) {
          props.onChange(
            undefined,
            `Invalid file selected, valid files are of [${exts.toString()}] types.`
          );
        } else {
          props.onChange(chosenFile);
        }
      } else {
        props.onChange(undefined, "getting file error");
      }

      // reset input
      // to be able to upload the same file again if it was canceled
      event.target.value = "";
    }
  };

  return (
    <div className={classes.root}>
      <input
        ref={fileInput}
        onChange={onChange}
        type="file"
        multiple={false}
        hidden={true}
        accept=".csv, .txt"
      />
      <Grid container={true} alignItems="center" spacing={16}>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={onChoose}
            disabled={uploading}
            fullWidth={true}
          >
            choose a file
          </Button>
        </Grid>
        <Grid item={true} xs={6} sm={4} md={3} lg={2}>
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              color="primary"
              disabled={!props.file || uploading}
              onClick={props.onUpload}
              fullWidth={true}
            >
              Upload
              <CloudUploadIcon className={classes.rightIcon} />
            </Button>
            {uploading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
        <Grid item={true} xs={12}>
          {props.file && !uploading && (
            <Chip
              label={props.file.name}
              onDelete={props.onCancel}
              className={classes.chip}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};
