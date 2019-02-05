import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
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
  button: {
    margin: spacing.unit
  }
}));

interface IProps {
  file?: File;
  onChange: (chosenFile?: File, error?: string) => void;
  onUpload: (event: any) => void;
  onCancel: (event: any) => void;
}

export const UploadControls = (props: IProps): JSX.Element => {
  const classes = useStyles();
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
      />
      <Button variant="contained" color="primary" onClick={onChoose}>
        choose a file
      </Button>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        disabled={!props.file}
        onClick={props.onUpload}
      >
        Upload
        <CloudUploadIcon className={classes.rightIcon} />
      </Button>
      {props.file && (
        <Grid item={true} xs={12}>
          <Chip
            label={props.file.name}
            onDelete={props.onCancel}
            className={classes.chip}
          />
        </Grid>
      )}
    </div>
  );
};
